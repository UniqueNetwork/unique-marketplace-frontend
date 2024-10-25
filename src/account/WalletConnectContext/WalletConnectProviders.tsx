import React from "react";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { unique, uniqueOpal, uniqueQuartz } from "viem/chains";

const queryClient = new QueryClient();

const projectId = 'f7355c4a8483073af9629880e7887524' as string;
const metadata = {
  name: "Unique NFT Marketplace",
  description: "",
  url: "https://unqnft.io/",
  icons: [""],
};

export const config = defaultWagmiConfig({
  chains: [unique, uniqueOpal, uniqueQuartz],
  projectId,
  metadata,
  auth: {
    email: false,
    socials: [],
  },
});

const METAMASK_ID = 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96' as string;
const ZERION_ID = 'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18' as string;
const TRUST_ID = '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0' as string;


createWeb3Modal({
  wagmiConfig: config,
  projectId,
  includeWalletIds: [
    METAMASK_ID, ZERION_ID, TRUST_ID,
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa'
  ],
  enableSwaps: false,
  enableOnramp: false,
  enableAnalytics: false,
  allowUnsupportedChain: true,
});

export const WalletConnectProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
