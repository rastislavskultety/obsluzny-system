import debug from 'debug';

const debugSocket = debug('socket');

export const defaultIpcConfig = {
  retry: 1500,
  maxRetries: 10,
  logger: debugSocket,
  silent: !debugSocket.enabled
}
