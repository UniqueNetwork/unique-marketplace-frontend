declare type Env = {
  REACT_APP_DOCUMENT_TITLE: string | undefined
  REACT_APP_UNIQUE_COLLECTION_IDS: string | undefined,
  REACT_APP_IPFS_GATEWAY: string | undefined,
  REACT_APP_UNIQUE_API_URL: string | undefined,
  REACT_APP_SCAN_URL: string | undefined,
  REACT_APP_RAMP_API_KEY: string | undefined,
} & Record<string, string | undefined>

declare type Config = {
  documentTitle: string | undefined
  feturedCollectionIds: number[]
  uniqueApiUrl: string | undefined
  scanUrl: string | undefined
  walletUrl: string | undefined
  IPFSGateway: string | undefined
  rampApiKey: string | undefined
}

declare global {
  interface Window {
    ENV: Env
  }
}

const config: Config = {
  documentTitle: window.ENV?.DOCUMENT_TITLE || process.env.REACT_APP_DOCUMENT_TITLE,
  feturedCollectionIds: (window.ENV?.UNIQUE_COLLECTION_IDS || process.env.REACT_APP_UNIQUE_COLLECTION_IDS)?.split(',').map(Number) || [],
  uniqueApiUrl: window.ENV?.UNIQUE_API_URL || process.env.REACT_APP_UNIQUE_API_URL,
  IPFSGateway: window.ENV?.IPFS_GATEWAY || process.env.REACT_APP_IPFS_GATEWAY,
  scanUrl: window.ENV?.SCAN_URL || process.env.REACT_APP_SCAN_URL,
  walletUrl: window.ENV?.WALLET_URL || process.env.REACT_APP_WALLET_URL,
  rampApiKey: window.ENV && 'RAMP_API_KEY' in window.ENV ? window.ENV.RAMP_API_KEY : process.env.REACT_APP_RAMP_API_KEY
};

export default config;
