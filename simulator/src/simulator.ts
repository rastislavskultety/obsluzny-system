/*
 * Simulácia užívateľských požiadaviek
 */

import axios, { CancelTokenSource } from 'axios';
import { Server } from 'socket.io';
import { sleep } from './lib/sleep';

/*
 * Parametre simulácie
 */
export interface SimParams {
  numberOfUsers: number; // Počet užívateľov
  meanRequestTime: number; // Doba medzi požiadavkami
  requestTimeDeviation: number; // Náhodnosť doby medzi požiadavkami
}

interface RegisteredUser {
  id: number,
  sid: string
}

/*
 * Trieda simulátora užívateľských požiadaviek
 */
export class Simulator {
  // Indikátor bežania simulácie
  private running = false;

  // Indikátor požiadavky na prerušenie simulácie
  private abortRequest = false;

  // Token pre zrušenie prebiehajúcich ajax volaní
  private cancelSource: CancelTokenSource;

  // Registrovaných užívatelia počas simulácie
  private registered: RegisteredUser[];

  /*
   * Konštruktor
   *
   * Parametre:
   * - urlPrefix = cesta k serveru ktorému sa posielajú simulované požiadavky
   * - io = websocket server
   * - options.logging - zapnutie logovania
   */
  constructor(private urlPrefix: string, private io: Server, private options?: any) {
  }

  /*
   * Spustenie simulácie
   */
  start(params: SimParams) {
    if (this.running) {
      this.stop();
    }

    if (this.options?.logging) {
      // tslint:disable-next-line:no-console
      console.log('Starting simulation with params: ', JSON.stringify(params));
    }

    this.running = true; // Indikuje že simulácia beží

    this.abortRequest = false; // Vynulovanie požiadavky na zrušenie
    this.cancelSource = axios.CancelToken.source(); // Vytvorenie tokena pre zrušenie ajax volaní

    // Pošlí včetkým pripojeným klientom správu so zmenom statusu na 'running'
    this.io.emit("status", true);

    // Počítadlo požiadaviek
    let requestCount = 0;

    /*
     * Odoslanie log správy včetkým klientom
     */
    const log = (text: string) => {
      this.io.emit('log', text);
    };

    /*
     * Spracovanie chyby
     */
    const abort = (error: Error) => {
      // Informuj všetkých klientov o chybe
      this.io.emit('error', 'Simulácia ukončená kvôli chybe.');
      this.io.emit('log', error.message);

      // Ukonči simuláciu
      this.stop();
    };

    /*
     * Registrácia nového užívateľa
     */
    const registerUser = (index: number): Promise<any> => {
      return axios.post(
        this.urlPrefix + 'users/register',
        { username: `user${index}`, simulate: true },
        { cancelToken: this.cancelSource.token }
      )
        .then((result) => {
          log(`Registrácia užívateľa user${index}`);
          return result.data.sid;
        })
        .catch((error: Error) => {
          if (!axios.isCancel(error)) {
            abort(error);
          }
        });
    };

    /*
     * Vytvor a naplánuj požiadavku
     */
    const scheduleRequest = (userId: number, sid: string) => {
      // Určenie doby odoslania požiadavky
      const minDelay = Math.max(
        params.meanRequestTime - params.requestTimeDeviation,
        0
      );
      const maxDelay = params.meanRequestTime + params.requestTimeDeviation;
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;

      // Po uplynutí doby odošli požiadavku
      sleep(delay * 1000).then(() => {
        if (!this.abortRequest) {
          requestCount += 1;
          sendRequest(requestCount, userId, sid);
        }
      });
    };

    /*
     * Odošli požiadavku
     */
    const sendRequest = (requestId: number, userId: number, sid: string) => {
      log(`Požiadavka #${requestCount} od užívateľa user${userId} odoslaná`);

      // Čas odoslania požiadavky
      const startTime = Date.now();

      // Odošli požiadavku
      axios.get(this.urlPrefix + 'quotes', {
        cancelToken: this.cancelSource.token,
        params: { count: 1, sid },
      })
        .then(result => {
          // Výpočet doby spracovania
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          log(
            `Požiadavka #${requestId} od užívateľa user${userId} obslúžená strediskom #${result.data.serviceCenter
            } za ${duration}s`
          );
          // Naplánuj ďalšiu požiadavku
          if (!this.abortRequest) scheduleRequest(userId, sid);
        })
        .catch((error: any) => {
          // Spracovanie chyby, ak nebola vytvorená na základe zrušenia ajax volania
          if (!axios.isCancel(error)) {

            // Status 503 znamená že že fronta je plná a požiadavka je zamietnutá.
            // Pošleme správu klientom a pokračujeme ďalšou požiadavkou.
            if (error.message.match(/status code 503/)) {
              log(
                `Požiadavka #${requestId} od užívateľa user${userId} zamietnutá`
              );
              if (!this.abortRequest) scheduleRequest(userId, sid);
            } else {
              // Pri ostatných chybách prerušíme spracovanie
              abort(error);
            }
          }
        });
    };

    /* Hlavná časť */

    // Inicializuj zoznam sid registrovaných užívateľov
    this.registered = [];

    // Zaregistruj zadaný počet užívateľov
    for (let id = 0; id < params.numberOfUsers; ++id) {
      registerUser(id)
        .then((sid) => {
          // Zaznamenaj sid
          this.registered.push({ id, sid });

          // Naplánuj prvú požiadavku
          scheduleRequest(id, sid);
        })
        .catch((error: any) => {
          if (!axios.isCancel(error)) {
            abort(error);
          }
        });
    }
  }

  /*
   * Ukončenie simulácie
   */
  stop() {

    // Logout user, ignore any error
    const logoutUser = ({ id, sid }: RegisteredUser) => {
      return axios.post(this.urlPrefix + 'users/logout', { sid })
        .then(result => {
          this.io.emit('log', `Užívateľ user${id} bol odhlásený`);
        })
        .catch(error => {/* nothing */ });
    };

    if (this.running) {
      if (this.options?.logging) {
        // tslint:disable-next-line:no-console
        console.log('Stopping simulation');
      }
      this.running = false;
      this.abortRequest = true;
      this.cancelSource.cancel('Operation canceled by the user.');
      this.io.emit('status', false);

      // Odhlás všetkých užívateľov
      if (this.registered) {
        const arr = this.registered;
        this.registered = null;
        arr.forEach(logoutUser);
      }
    }
  }

  /*
   * Stav simulácie
   *
   * Návratová hodnota:
   * - true ak beží simulácia
   */
  isRunning() {
    return this.running;
  }
}
