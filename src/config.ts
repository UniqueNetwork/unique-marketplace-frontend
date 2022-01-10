declare type Env = {
  API_URL?: string;
  CHAIN_API?: string;
}
declare global {
  interface Window {
    ENV: Env
  }
}

const config: Env = {
  API_URL: window.ENV.API_URL || process.env.REACT_APP_API_URL,
  CHAIN_API: process.env.REACT_APP_UNIQUE_API,
}

export default config
