import config from '../config';
import { GqlClient } from './graphQL/gqlClient';
import RpcClient from './chainApi/rpcClient';

const { defaultChain, kusamaApiUrl } = config;

export const gqlClient = new GqlClient(defaultChain.gqlEndpoint);
export const rpcClient = new RpcClient(defaultChain.rpcEndpoint, kusamaApiUrl || '');
