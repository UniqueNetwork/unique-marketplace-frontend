import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { Chain, unique, uniqueOpal, uniqueQuartz } from "viem/chains";
import { createWeb3ModalConfig, WALLET_IDS } from "./Web3ModalConfig";

const availableChains: readonly [Chain, ...Chain[]] = [unique, uniqueOpal, uniqueQuartz];

interface Web3ModalContextType {
  currentChains: readonly [Chain, ...Chain[]];
  reinitializeWithChainName: (chainName: string) => void;
}

const Web3ModalContext = createContext<Web3ModalContextType | undefined>(undefined);

export const useWeb3ModalCustom = () => {
  const context = useContext(Web3ModalContext);
  if (context === undefined) {
    throw new Error('useWeb3Modal must be used within a Web3ModalProvider');
  }
  return context;
};

interface Web3ModalProviderProps {
  children: React.ReactNode;
  initialChains: readonly [Chain, ...Chain[]];
}

export const Web3ModalProvider: React.FC<Web3ModalProviderProps> = ({ children, initialChains }) => {
  const [currentChains, setCurrentChains] = useState<readonly [Chain, ...Chain[]]>(initialChains);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeWeb3Modal = useCallback((chains: readonly [Chain, ...Chain[]]) => {
    const config = createWeb3ModalConfig(chains);
    createWeb3Modal({
      wagmiConfig: config,
      projectId: 'f7355c4a8483073af9629880e7887524',
      includeWalletIds: Object.values(WALLET_IDS),
      enableSwaps: false,
      enableOnramp: false,
      enableAnalytics: false,
      allowUnsupportedChain: true,
    });
    setCurrentChains(chains);
    setIsInitialized(true);
  }, []);

  const reinitializeWithChainName = useCallback((chainName: string) => {
    const newChain = availableChains.find(chain => 
      chain.name.toLowerCase().includes(chainName.toLowerCase())
    );
    if (!newChain) throw new Error(`Invalid chain name: ${chainName}`);
    initializeWeb3Modal([newChain]);
  }, [initializeWeb3Modal]);

  useEffect(() => {
    if (!isInitialized) {
      initializeWeb3Modal(initialChains);
    }
  }, [initialChains, initializeWeb3Modal, isInitialized]);

  if (!isInitialized) {
    return null;
  }

  return (
    <Web3ModalContext.Provider value={{ currentChains, reinitializeWithChainName }}>
      {children}
    </Web3ModalContext.Provider>
  );
};

