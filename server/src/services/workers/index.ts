import { resolve } from "path";

export const workers = {
  queue: resolve(__dirname, './queue.js'),
  service: resolve(__dirname, './service.js'),
  pool: resolve(__dirname, './pool.js')
}
