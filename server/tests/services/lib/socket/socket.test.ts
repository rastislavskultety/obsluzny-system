import { expect } from 'chai';
import { IReplyCallback, SocketClient, SocketClientOptions, SocketServer } from '../../../../src/services/lib/socket';
import { createSocketTransport } from '../../../../src/services/lib/transport';

describe('socket', () => {

  const opened: { close: () => void }[] = [];

  afterEach(() => {
    while (opened.length) {
      opened.shift()!.close();
    }
  })

  function createServer(path: string) {
    const server = new SocketServer(path);
    opened.push(server);
    return server;
  }

  function createClient(path: string, options?: SocketClientOptions) {
    const client = new SocketClient(path, options);
    opened.push(client);
    return client;
  }

  it('should send data between server and client', (done) => {
    const path = '/tmp/unix.socket';

    const server = createServer(path);
    server
      .on('ready', () => {
        const client = createClient(path);
        client
          .on('ready', () => {
            client.send('hello', 'world');
          })
          .on('message', (reply: IReplyCallback, arr: string[]) => {
            expect(arr).to.deep.eq(['echo', 'hello', 'world']);
            done();
          });
      })
      .on('message', (reply: IReplyCallback, a: string, b: string) => {
        reply(['echo', a, b])
      })
  });

  it('should retry connection to server', (done) => {
    const path = '/tmp/unix.socket';

    // ak vytvorím najprv klient a potom server, tak sa klient najprv nebude môcť pripojiť
    const client = createClient(path, { waitRetry: 100 });

    client.send('hello', 'world');

    client.on('message', (reply: IReplyCallback, arr: string[]) => {
      expect(arr).to.deep.eq(['echo', 'hello', 'world']);
      done();
    });


    setTimeout(() => {

      const server = createServer(path);

      server.on('message', (reply: IReplyCallback, a: string, b: string) => {
        reply(['echo', a, b])
      })

    }, 200);
  });

  it('Should create transport', async () => {
    const path = '/tmp/unix.socket';

    const server = createSocketTransport(createServer(path));
    await new Promise(resolve => setTimeout(resolve, 500));
    const client = createSocketTransport(createClient(path));

    server.on('message', (reply, a: string, b: string) => {
      reply(null, ['echo', a, b]);
    });

    expect(await client.send('hello', 'world')).to.deep.equal(['echo', 'hello', 'world']);
  })


});

