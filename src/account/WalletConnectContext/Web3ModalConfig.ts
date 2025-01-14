import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { Chain } from "viem";

const projectId = 'f7355c4a8483073af9629880e7887524' as string;
const metadata = {
  name: "Unique NFT Marketplace",
  description: "",
  url: "https://unqnft.io/",
  icons: [""],
};

export const WALLET_IDS = {
  METAMASK: 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
  ZERION: 'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18',
  TRUST: '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
  NOVA_WALLET: '43fd1a0aeb90df53ade012cca36692a46d265f0b99b7561e645af42d752edb92',
  COINBASE: 'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa'
} as const;

export function createWeb3ModalConfig(chains: readonly [Chain, ...Chain[]]) {
  return defaultWagmiConfig({ 
    chains,
    projectId,
    metadata,
    auth: {
      email: false,
      socials: [],
    },
  });
}
