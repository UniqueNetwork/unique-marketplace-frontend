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
  url: "https://market.uniquenetwork.dev/",
  icons: [""],
};

export const config = defaultWagmiConfig({
  chains: [unique, uniqueOpal, uniqueQuartz],
  projectId,
  metadata,
});

const METAMASK_ID = process.env.REACT_APP_METAMASK_ID as string;
const ZERION_ID = process.env.REACT_APP_ZERION_ID as string;
const TRUST_ID = process.env.REACT_APP_TRUST_ID as string;


createWeb3Modal({
  wagmiConfig: config,
  projectId,
  // includeWalletIds: [
  //   METAMASK_ID, ZERION_ID, TRUST_ID
  // ],
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
