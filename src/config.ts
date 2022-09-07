import { Chain, getChainList } from './utils/configParser';

declare type Env = {
  REACT_APP_DOCUMENT_TITLE: string | undefined
  REACT_APP_RAMP_API_KEY: string | undefined,
} & Record<string, string | undefined>

declare type Config = {
  documentTitle: string | undefined
  rampApiKey: string | undefined
  blockchains: Record<string, Chain>
}

declare global {
  interface Window {
    ENV: Env
  }
}

const blockchains = getChainList(window.ENV || process.env);

const config: Config = {
  documentTitle: window.ENV?.DOCUMENT_TITLE || process.env.REACT_APP_DOCUMENT_TITLE,
  rampApiKey: window.ENV && 'RAMP_API_KEY' in window.ENV ? window.ENV.RAMP_API_KEY : process.env.REACT_APP_RAMP_API_KEY,
  blockchains
};

export default config;
