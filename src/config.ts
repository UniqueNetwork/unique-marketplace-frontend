import { Chain, getChainList } from './utils/configParser';

declare type Env = {
  REACT_APP_DOCUMENT_TITLE: string | undefined
  REACT_APP_RAMP_API_KEY: string | undefined,
  REACT_APP_ZENDESK_API: string | undefined,
  REACT_APP_ZENDESK_OAUTH_APP_TOKEN: string | undefined
} & Record<string, string | undefined>

declare type Config = {
  documentTitle: string | undefined
  rampApiKey: string | undefined
  zendeskApi: string | undefined
  zenDeskToken: string | undefined
  blockchains: Record<string, Chain>
}

declare global {
  interface Window {
    ENV: Env
    walletExtension?: { isNovaWallet?: boolean }
    ethereum?: any & {
      isMetaMask?: boolean
    }
  }
}

const blockchains = getChainList(window.ENV || process.env);

const config: Config = {
  documentTitle: window.ENV?.DOCUMENT_TITLE || process.env.REACT_APP_DOCUMENT_TITLE,
  rampApiKey: window.ENV && 'RAMP_API_KEY' in window.ENV ? window.ENV.RAMP_API_KEY : process.env.REACT_APP_RAMP_API_KEY,
  zendeskApi: window.ENV && 'ZENDESK_API' in window.ENV ? window.ENV.ZENDESK_API : process.env.REACT_APP_ZENDESK_API,
  zenDeskToken: window.ENV && 'ZENDESK_OAUTH_APP_TOKEN' in window.ENV ? window.ENV.ZENDESK_OAUTH_APP_TOKEN : process.env.REACT_APP_ZENDESK_OAUTH_APP_TOKEN,
  blockchains
};

export default config;
