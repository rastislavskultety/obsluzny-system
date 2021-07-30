import { expect } from 'chai';
import { Worker, MessageChannel, MessagePort, isMainThread, workerData, parentPort } from 'worker_threads';
import { workerTypescript } from './lib/ts-worker';
import { createMessagePortTransport, createWorkerTransport } from '../../../../src/services/lib/transport';
import { setTimeout as wait, setImmediate as nextTick } from 'timers/promises'

if (isMainThread) {

  const startWorker = (id: string, slavePort?: MessagePort): Worker => {
    let options = slavePort ? {
      workerData: { id, slavePort },
      transferList: [slavePort]
    } : {
      workerData: { id }
    }
    return workerTypescript(__filename, options);
  }

  const termination = (worker: Worker): Promise<number> => {
    return new Promise(resolve => worker.on('exit', resolve));
  }

  describe('worker-thread-transport.ts', function () {

    // definuj timeout pre testy, veľká hodnota je tu pre to že
    // sa každý worker najprv transpiluje z typesriptu
    this.timeout(5000);

    // definuj čo považuje mocha za pomalý test
    this.slow(2000);

    describe('Using MessageChannel', () => {

      const setupUsingMessageChannel = () => {
        let { port1: masterPort, port2: slavePort } = new MessageChannel();
        let worker = startWorker('workerEchoMessagePort', slavePort);
        let transport = createMessagePortTransport(masterPort);
        return { worker, transport };
      }

      it('should terminate worker', async () => {
        const { worker, transport } = setupUsingMessageChannel();
        worker.terminate();
        expect(await termination(worker)).to.eq(0);
      });

      it('should send and receive messages', async () => {
        const { worker, transport } = setupUsingMessageChannel();

        expect(await transport.send('hello', 'world', 0, 0)).to.deep.eq(
          ['echo', 'hello', 'world', 0]);

        worker.terminate();
        expect(await termination(worker)).to.eq(1);
      });

      it('should send and receive multiple messages', async () => {
        const N = 5;
        const MAX_DELAY = 150;

        const { worker, transport } = setupUsingMessageChannel();

        let sends = [];
        for (let i = 0; i < N; ++i) {
          sends.push(transport.send('hello', 'world', i, Math.random() * MAX_DELAY))
        }

        expect(await Promise.all(sends)).to.deep.eq([
          ['echo', 'hello', 'world', 0],
          ['echo', 'hello', 'world', 1],
          ['echo', 'hello', 'world', 2],
          ['echo', 'hello', 'world', 3],
          ['echo', 'hello', 'world', 4],
        ])

        worker.terminate();
        expect(await termination(worker)).to.eq(1);
      })

      it('close method should terminate worker', async () => {
        const { worker, transport } = setupUsingMessageChannel();

        const log: string[] = [];

        transport.on('close', () => log.push('transport.onClose'));

        transport.close();

        expect(log.sort()).to.deep.eq(['transport.onClose']);
        expect(await termination(worker)).to.eq(0);
      });


      it('terminating worker should fire transport onClose', async () => {
        const { worker, transport } = setupUsingMessageChannel();

        const log: string[] = [];

        transport.on('close', () => log.push('transport.onClose'));

        worker.terminate();
        expect(await termination(worker)).to.eq(0);
        for (let i = 0; i < 5; ++i)await nextTick();

        expect(log.sort()).to.deep.eq(['transport.onClose']);
      });
    });

    describe('Using Worker & parentPort', () => {

      const setupUsingWorker = () => {
        let worker = startWorker('workerEchoParentPort');
        let transport = createWorkerTransport(worker);
        return { worker, transport };
      }

      it('should send and receive messages', async () => {
        const N = 5;
        const MAX_DELAY = 150;

        const { worker, transport } = setupUsingWorker();

        let sends = [];
        for (let i = 0; i < N; ++i) {
          sends.push(transport.send('hello', 'world', i, Math.random() * MAX_DELAY))
        }

        expect(await Promise.all(sends)).to.deep.eq([
          ['echo', 'hello', 'world', 0],
          ['echo', 'hello', 'world', 1],
          ['echo', 'hello', 'world', 2],
          ['echo', 'hello', 'world', 3],
          ['echo', 'hello', 'world', 4],
        ])

        worker.terminate();
        expect(await termination(worker)).to.eq(1);
      })

      it('close method should terminate worker', async () => {
        const { worker, transport } = setupUsingWorker();

        const log: string[] = [];

        transport.on('close', () => log.push('transport.onClose'));

        transport.close();

        expect(log.sort()).to.deep.eq(['transport.onClose']);
        expect(await termination(worker)).to.eq(0);
      });


      it('terminating worker should fire transport onClose', async () => {
        const { worker, transport } = setupUsingWorker();
        const log: string[] = [];

        transport.on('close', () => log.push('transport.onClose'));

        worker.terminate();
        expect(await termination(worker)).to.eq(0);
        for (let i = 0; i < 5; ++i)await nextTick();

        expect(log.sort()).to.deep.eq(['transport.onClose']);
      });
    });

    describe('Error handling', () => {

      const setupFail = () => {
        let { port1: masterPort, port2: slavePort } = new MessageChannel();
        let worker = startWorker('workerFail', slavePort);
        let transport = createMessagePortTransport(masterPort);
        return { worker, transport };
      }

      it('should reject result promise on error', async () => {
        const { worker, transport } = setupFail();

        let error;
        try {
          let result = await transport.send();
          console.log('RESULT', result)
        } catch (err) {
          error = err;
        }

        worker.terminate();

        expect(error).to.be.an('Error');
        expect(error.message).to.eq('test error')
      })
    });

  });
} else {
  const testWorkerThreads: { [index: string]: () => void } = {
    // Echo message on slavePort
    workerEchoMessagePort() {
      let transport = createMessagePortTransport(workerData.slavePort);

      transport.on('message', async (reply, a: string, b: string, id: number, delay: number) => {
        await wait(delay);
        reply(null, ['echo', a, b, id]);
      });
    },

    // Echo message on parentPort
    workerEchoParentPort() {
      let transport = createMessagePortTransport(parentPort!);

      transport.on('message', async (reply, a: string, b: string, id: number, delay: number) => {
        await wait(delay);
        reply(null, ['echo', a, b, id]);
      });
    },

    workerFail() {
      let transport = createMessagePortTransport(workerData.slavePort);

      transport.on('message', async (reply) => {
        reply(new Error('test error'));
      });

    }
  }

  if (workerData.id && typeof testWorkerThreads[workerData.id] == "function") {
    testWorkerThreads[workerData.id]();
  } else {
    console.error('Worker thread not identified');
    process.exit(2);
  }
}


