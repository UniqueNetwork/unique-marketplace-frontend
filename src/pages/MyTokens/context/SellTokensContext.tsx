import { TokenForSale } from 'pages/CreateNFT/types';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MassListingButton } from './MassListingButton';
import { useLocation } from 'react-router-dom';

interface SelectedTokensContextProps {
  selectedTokens: TokenForSale[];
  toggleTokenSelection: (token: TokenForSale) => void;
  selectAll: (tokens: TokenForSale[]) => void;
  deselectAll: () => void;
}

const SelectedTokensContext = createContext<SelectedTokensContextProps | undefined>(undefined);

export const SelectedTokensProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTokens, setSelectedTokens] = useState<TokenForSale[]>([]);
  const location = useLocation();

  const toggleTokenSelection = (token: TokenForSale) => {
    setSelectedTokens((prevSelected) => {
      const isAlreadySelected = prevSelected.some((t) => t.tokenId === token.tokenId && t.collectionId === token.collectionId);
      if (isAlreadySelected) {
        return prevSelected.filter((t) => t.tokenId !== token.tokenId || t.collectionId !== token.collectionId);
      } else {
        return [...prevSelected, token];
      }
    });
  };

  const selectAll = (tokens: TokenForSale[]) => {
    setSelectedTokens(tokens);
  };

  const deselectAll = () => {
    setSelectedTokens([]);
  };

  useEffect(() => {
    deselectAll();
  }, [location.pathname]);

  return (
    <SelectedTokensContext.Provider
      value={{ selectedTokens, toggleTokenSelection, selectAll, deselectAll }}
    >
      <MassListingButton />
      {children}
    </SelectedTokensContext.Provider>
  );
};

export const useSelectedTokens = () => {
  const context = useContext(SelectedTokensContext);
  if (!context) {
    throw new Error('useSelectedTokens must be used within a SelectedTokensProvider');
  }
  return context;
};
