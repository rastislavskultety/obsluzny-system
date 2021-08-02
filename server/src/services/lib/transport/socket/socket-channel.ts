import { EventEmitter } from "events";

export abstract class SocketChannel extends EventEmitter {
  private ready = false;

  public isReady(): boolean {
    return this.ready;
  }

  protected setReady() {
    this.ready = true;
    this.emit('ready');
  }
}
