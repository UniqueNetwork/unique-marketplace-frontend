import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useApi } from 'hooks/useApi';
import { useSelectedTokens } from './SellTokensContext';
import { Button } from 'components/UI';

export const MassListingButton: React.FC = () => {
  const { selectedTokens, deselectAll } = useSelectedTokens();
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const { currentChainId } = useApi();

  const hasSelectedTokens = selectedTokens.length > 0;

  useEffect(() => {
    if (hasSelectedTokens) {
      setVisible(true);
    } else if (!hasSelectedTokens && visible) {
      setVisible(false);
    }
  }, [hasSelectedTokens]);

  const goToMassListing = () => {
    localStorage.setItem('tokensForSell', JSON.stringify(selectedTokens));
    deselectAll();
    navigate(`/${currentChainId}/mass-listing`);
  };

  if (!hasSelectedTokens && !visible) return null;

  return (
    <FixedButtonWrapper>
      <FixedButton
        onClick={goToMassListing}
        role="primary"
        title={`Sell ${selectedTokens.length} ${selectedTokens.length === 1 ? 'token' : 'tokens'}`}
        state={hasSelectedTokens ? 'enter' : 'leave'}
      />
    </FixedButtonWrapper>
  );
};

const slideInFromRight = keyframes`
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const slideOutToRight = keyframes`
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

const FixedButtonWrapper = styled.div`
  position: fixed;
  bottom: 0;
  right: 10px;
  z-index: 11;
 
  @media (min-width: 768px) {
    padding-right: 12px;
  }

  @media (min-width: 1024px) {
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    background: white;
    padding: 10px;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-right: 24px;
  }

  @media (min-width: 1280px) {
    padding-right: 48px;
  }

  @media (min-width: 1920px) {
    padding-right: max(12px, calc(50% - 680px));
  }
`;

const FixedButton = styled(Button)<{ state: 'enter' | 'leave' }>`
  animation: ${({ state }) => (state === 'enter' ? slideInFromRight : slideOutToRight)} 0.3s forwards ease-in-out;

  margin: 0 0 10px;
`;
