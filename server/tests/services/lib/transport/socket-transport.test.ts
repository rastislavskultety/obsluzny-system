import { expect } from 'chai';
import { createClientSocketTransport, createServerSocketTransport, Transport } from '../../../../src/services/lib/transport';


describe('socket-transport', function () {

  let clientTransport: Transport;
  let serverTransport: Transport;

  before(async () => {
    serverTransport = createServerSocketTransport('server');
    serverTransport.on('message', (reply, fn: string, x: number, y: number) => {
      switch (fn) {
        case 'add':
          reply(null, x + y);
          break;
        case 'fail':
          reply(new Error('test error'));
          break;
        default:
          throw new Error('invalid function');
      }
    });
    await serverTransport.waitReady();


    clientTransport = createClientSocketTransport('server', 'client');
    await clientTransport.waitReady();
  });

  after(() => {
    serverTransport.close();
    clientTransport.close();
  });

  it('should return value', async () => {
    expect(await clientTransport.send('add', 3, 4)).to.eq(7);
  });

  it('should return error', async () => {
    let error;
    try {
      await clientTransport.send('fail');
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an('object'); // pri prenose cez transport sa Error zmení na Object literal
    expect(error.message).to.eq('test error');
  });
});
