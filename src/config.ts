declare type Env = Record<string, string>

declare global {
  interface Window {
    ENV: Env
  }
}

const config: Env = {
  ...(window.ENV || process.env),
}

export default config
