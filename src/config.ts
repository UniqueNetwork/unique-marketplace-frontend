declare type Env = {
  API_URL?: string;
  UNIQUE_API?: string;
}
declare global {
  interface Window {
    ENV: Env
  }
}

export type Chain = {
  name: string;
  clientEndpoint: string
  rpcEndpoint: string
}

const chains: Record<string, Chain> = {
  ['OPAL by UNIQUE']: {
    name: 'OPAL by UNIQUE',
    clientEndpoint: 'https://hasura-opal.unique.network/v1/graphql',
    rpcEndpoint: 'wss://opal.unique.network',
  },
  ['QUARTZ by UNIQUE']: {
    name: 'QUARTZ by UNIQUE',
    clientEndpoint: 'https://dev-api-explorer.unique.network/v1/graphql',
    rpcEndpoint: 'wss://quartz.unique.network',
  },
}

const config: Env = {
  API_URL: window.ENV.API_URL || process.env.REACT_APP_API_URL,
  UNIQUE_API: process.env.REACT_APP_UNIQUE_API,
}

export { chains };

export default config;
