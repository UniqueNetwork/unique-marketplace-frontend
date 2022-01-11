// import React, { FC, useEffect, useMemo, useState } from 'react'
// import { ApiPromise } from '@polkadot/api/promise'
// import { WsProvider } from '@polkadot/rpc-provider'
// import { ApiContextProps, ApiProvider, ChainData } from './context/ApiContext'
// import { formatBalance } from '@polkadot/util'
// import { ApolloProvider, HttpLink } from '@apollo/client'
// import client from './api/gqlClient'
// import chains, { Chain, defaultChain } from './chains'
// class ChainApi {
//   private async retrieve(api: ApiPromise): Promise<ChainData> {
//     const [chainProperties, systemChain, systemName] = await Promise.all([
//       api.rpc.system.properties(),
//       api.rpc.system.chain(),
//       api.rpc.system.name(),
//     ])

//     return {
//       properties: {
//         tokenSymbol: chainProperties.tokenSymbol
//           .unwrapOr([formatBalance.getDefaults().unit])[0]
//           .toString(),
//       },
//       systemChain: (systemChain || '<unknown>').toString(),
//       systemName: systemName.toString(),
//     }
//   }

  

// }

// const chainApi = new ChainApi();

// export default chainApi;

export default {};