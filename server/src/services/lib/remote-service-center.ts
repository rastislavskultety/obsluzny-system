import { IServiceCenter } from "./queue";
import { RPCClient } from "./rpc";
import { ServiceRequest, ServiceResponse } from "./service-center";

export class RemoteServiceCenter implements IServiceCenter<ServiceRequest, ServiceResponse>{
  constructor(private rpc: RPCClient) { }

  async serve(request: ServiceRequest): Promise<ServiceResponse> {
    return this.rpc.call('serve', request);
  }
}
