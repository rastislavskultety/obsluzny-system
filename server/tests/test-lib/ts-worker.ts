import { Worker } from 'worker_threads';

/*
 * Run typescript worker using ts-node
 *
 * See: https://stackoverflow.com/a/57949531
 */
export const workerTypescript = (file: string, options?: any): Worker => {
  const data = Object.assign({}, options?.workerData, { __filename: file })
  const opts = Object.assign({}, options, {
    eval: true,
    workerData: data
  });
  return new Worker(`
            const wk = require('worker_threads');
            require('ts-node').register();
            let file = wk.workerData.__filename;
            delete wk.workerData.__filename;
            require(file);
        `,
    opts
  );
}
