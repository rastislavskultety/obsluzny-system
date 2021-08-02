import redis from 'redis';
import { promisify } from "util";
import debug from 'debug';

const debugRedis = debug('redis');

const methodSubset = [
  'quit',
  'del',
  'get',
  'set',
  'sadd',
  'srem',
  'scard',
  'sismember',
  'flushall'];

export class RedisStore {
  private client: redis.RedisClient;
  private methods: { [index: string]: (...args: any[]) => Promise<any> } = {};

  constructor(options?: any) {
    options = options || {};
    debugRedis('connecting with options = %o', options)
    this.client = redis.createClient(options);

    this.client.on("error", (error: any) => {
      // tslint:disable-next-line:no-console
      console.error(error);
    });

    methodSubset.forEach(method => {
      this.methods[method] = promisify((this.client as any)[method]).bind(this.client);
    });
  }

  async call(methodName: string, ...args: any[]): Promise<any> {
    debugRedis('calling %o with %o', methodName, args);
    const fn = this.methods[methodName];
    if (fn) {
      const result = await fn(...args);
      debugRedis('calling %o returned %o', methodName, result);
      return result;
    }
    else
      throw new Error(`Invalid redis call: ${methodName}`);
  }
}


export const storeKeys = {
  session: 'sessions',
  sessionDataPrefix: 'session:',
  configuration: 'config'
}
