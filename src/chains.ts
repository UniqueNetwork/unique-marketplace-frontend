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
    clientEndpoint: 'https://hasura-quartz.unique.network/v1/graphql',
    rpcEndpoint: 'wss://quartz.unique.network',
  },
}

const defaultChain = 'OPAL by UNIQUE'

export { defaultChain }

export default chains