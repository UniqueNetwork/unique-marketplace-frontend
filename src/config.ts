declare type Env = {
  API_URL?: string;
}
declare global {
  interface Window {
    ENV: Env
  }
}

const config: Env = {
  API_URL: process.env.REACT_APP_API_URL,
}

export default config;
