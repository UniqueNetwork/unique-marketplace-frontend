import RpcClient from './chainApi/rpcClient';
import { GqlClient } from './graphQL/gqlClient';
// import { SdkClient } from './uniqueSdk/sdkClient';

// TODO remove gqlClient
export const gqlClient = new GqlClient('');

export const rpcClient = new RpcClient();
