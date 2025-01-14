import React from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Chain, unique, uniqueOpal, uniqueQuartz } from "viem/chains";
import { createWeb3ModalConfig } from "./Web3ModalConfig";
import { Web3ModalProvider } from "./Web3ModalContext";

const queryClient = new QueryClient();

interface WalletConnectProvidersProps {
  children: React.ReactNode;
  initialChains?: readonly [Chain, ...Chain[]];
}

export const WalletConnectProviders: React.FC<WalletConnectProvidersProps> = ({ 
  children, 
  initialChains = [unique, uniqueQuartz, uniqueOpal] 
}) => {
  const initialConfig = createWeb3ModalConfig(initialChains);

  return (
    <WagmiProvider config={initialConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3ModalProvider initialChains={initialChains}>
          {children}
        </Web3ModalProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

