import { expect } from 'chai';
import { Transport } from '../../../../src/services/lib/transport';
import { createLogProxy, Logger } from '../../../test-lib/log-proxy';
import { setTimeout as wait } from 'timers/promises';

class Channel {
  on(eventName: string, listener: (...args: any[]) => void): this {
    return this;
  }
  send(...args: any): void {
  }
  close() {
  }
  isReady(): boolean {
    return true;
  }
}

describe('transport', () => {
  it('should send message and receive reply', async () => {
    const log = new Logger();

    const chan = createLogProxy(new Channel(), log);
    const transport = new Transport(chan);

    // transport nastaví listener na príjímanie správ v kanáli
    expect(log.select('Channel', 'on', 'message')).to.be.an('array').of.length(1);
    const chanMessageListener = log.select('Channel', 'on', 'message')[0][3];
    expect(chanMessageListener).to.be.a('function');

    // odošleme testovaciu správu
    const resultPromise = transport.send(1, 2, 3);

    // správa musí byť poslaná kanálu s obálkou
    expect(log.select('Channel', 'send')).to.be.an('array').of.length(1);
    expect(log.select('Channel', 'send')).to.deep.eq([['Channel', 'send', { id: 0, type: "message" }, 1, 2, 3]]);

    // nastavíme
    const tranMessageListener = (...args: any[]) => log.push(['Transport', 'message', ...args]);
    const reply = (...args: any[]) => log.push(['Transport', 'reply', ...args]);
    transport.on('message', tranMessageListener);

    chanMessageListener(reply, { id: 0, type: "response", response: 'hello' });
    expect(await resultPromise).to.eq('hello');

    expect(log.select('Transport')).of.length(0); // transport nezavolá ani reply
  })

  it('should receive message and deliver reply', async () => {

    const log = new Logger();

    const chan = createLogProxy(new Channel(), log);
    const transport = new Transport(chan);

    const tranMessageListener = (reply: any, ...args: any[]) => {
      log.push(['Transport', 'incoming-message', ...args]);
      reply(null, ['returned value', ...args]);
    }

    const reply = (...args: any[]) => {
      log.push(['Transport', 'sending-reply', ...args]);
      chan.send(...args);
    };

    // transport nastaví listener na príjímanie správ v kanáli
    expect(log.select('Channel', 'on', 'message')).to.be.an('array').of.length(1);
    const chanMessageListener = log.select('Channel', 'on', 'message')[0][3];
    expect(chanMessageListener).to.be.a('function');

    // nastavíme listener na správy v transporte
    transport.on('message', tranMessageListener);

    // simulujeme prijatie správy z kanálu
    chanMessageListener(reply, { id: 123, type: 'message' }, 'payload1', 'payload2');

    // výsledok by mal byť doručený
    expect(log.select('Channel', 'send')).to.be.an('array').of.length(1);
    expect(log.select('Channel', 'send')[0].slice(2)).to.deep.eq([{ id: 123, type: "response", response: ['returned value', 'payload1', 'payload2'] }]);
  })

  it('should receive message and return error', async () => {

    const log = new Logger();

    const chan = createLogProxy(new Channel(), log);
    const transport = new Transport(chan, { errorProxy: true });

    const tranMessageListener = (reply: any, ...args: any[]) => {
      log.push(['Transport', 'incoming-message', ...args]);
      reply(new Error('test error'));
    }

    const reply = (...args: any[]) => {
      log.push(['Transport', 'sending-reply', ...args]);
      chan.send(...args);
    };

    // transport nastaví listener na príjímanie správ v kanáli
    expect(log.select('Channel', 'on', 'message')).to.be.an('array').of.length(1);
    const chanMessageListener = log.select('Channel', 'on', 'message')[0][3];
    expect(chanMessageListener).to.be.a('function');

    // nastavíme listener na správy v transporte
    transport.on('message', tranMessageListener);

    // simulujeme prijatie správy z kanálu
    chanMessageListener(reply, { id: 123, type: 'message' }, 'payload1', 'payload2');

    // výsledok by mal byť doručený
    expect(log.select('Channel', 'send')).to.be.an('array').of.length(1);
    const data = log.select('Channel', 'send')[0].slice(2)[0];
    expect(data.id).to.eq(123);
    expect(data.type).to.eq('error');
    expect(data.error).to.be.an('object'); // pri prenose cez transport sa Error zmení na Object literal
    expect(data.error.message).to.eq('test error');
  })



  it('should receive message and return error after throw', async () => {

    const log = new Logger();

    const chan = createLogProxy(new Channel(), log);
    const transport = new Transport(chan, { errorProxy: true });

    const tranMessageListener = (reply: any, ...args: any[]) => {
      log.push(['Transport', 'incoming-message', ...args]);
      throw new Error('test error');
    }

    const reply = (...args: any[]) => {
      log.push(['Transport', 'sending-reply', ...args]);
      chan.send(...args);
    };

    // transport nastaví listener na príjímanie správ v kanáli
    expect(log.select('Channel', 'on', 'message')).to.be.an('array').of.length(1);
    const chanMessageListener = log.select('Channel', 'on', 'message')[0][3];
    expect(chanMessageListener).to.be.a('function');

    // nastavíme listener na správy v transporte
    transport.on('message', tranMessageListener);

    // simulujeme prijatie správy z kanálu
    chanMessageListener(reply, { id: 123, type: 'message' }, 'payload1', 'payload2');

    // výsledok by mal byť doručený
    expect(log.select('Channel', 'send')).to.be.an('array').of.length(1);
    const data = log.select('Channel', 'send')[0].slice(2)[0];
    expect(data.id).to.eq(123);
    expect(data.type).to.eq('error');
    expect(data.error).to.be.an('object'); // pri prenose cez transport sa Error zmení na Object literal
    expect(data.error.message).to.eq('test error');
  })
});
