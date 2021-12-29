declare type Env = {
  API_URL?: string;
  UNIQUE_API?: string;
}
declare global {
  interface Window {
    ENV: Env
  }
}

const config: Env = {
  API_URL: window.ENV.API_URL || process.env.REACT_APP_API_URL,
  UNIQUE_API: process.env.REACT_APP_UNIQUE_API,
}

export default config;
