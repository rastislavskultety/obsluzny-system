import { expect } from 'chai';
import { RPCClient, RPCServer } from '../../../src/services/lib/rpc';
import { createClientSocketTransport, createServerSocketTransport } from '../../../src/services/lib/transport';


class Test {
  add(x: number, y: number) { return x + y };
  async addAsync(x: number, y: number) { return x + y };
  fail(msg: string) { throw new Error(msg) };
  async failAsync(msg: string) { throw new Error(msg) };
}


describe('rpc', function () {

  let clientRpc: RPCClient;
  let serverRpc: RPCServer;
  const test = new Test();

  // this.timeout(5000);

  before(async () => {
    let serverTransport = createServerSocketTransport('server');
    await serverTransport.waitReady();

    let clientTransport = createClientSocketTransport('server', 'client');
    await clientTransport.waitReady();

    serverRpc = new RPCServer(serverTransport);
    clientRpc = new RPCClient(clientTransport);

    serverRpc.registerObjectMethods(test, ['add', 'addAsync', 'fail', 'failAsync']);
  });

  after(() => {
    serverRpc.close();
    clientRpc.close();
  });

  it('should return value', async () => {
    expect(await clientRpc.call('add', 3, 4)).to.eq(7);
  });

  it('should return value from async method', async () => {
    expect(await clientRpc.call('addAsync', 3, 4)).to.eq(7);
  });

  it('should return error', async () => {
    let error;
    try {
      await clientRpc.call('fail', 'test error 1');
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an('object'); // pri prenose cez rpc sa Error zmení na Object literal
    expect(error.message).to.eq('test error 1');
  });

  it('should return error from async method', async () => {
    let error;
    try {
      await clientRpc.call('failAsync', 'test error 2');
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an('object'); // pri prenose cez rpc sa Error zmení na Object literal
    expect(error.message).to.eq('test error 2');
  });
})
