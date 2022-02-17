import RpcClient from './chainApi/rpcClient';
import {GqlClient} from "./graphQL/gqlClient";
import config from "../config";

const { defaultChain } = config;
//TODO remove gqlClient
export const gqlClient = new GqlClient('');

export const rpcClient = new RpcClient();
