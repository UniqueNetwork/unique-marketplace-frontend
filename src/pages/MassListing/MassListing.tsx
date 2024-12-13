import { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Button, Modal } from 'components/UI';
import { TokenLineSimple, TokenWithPrice } from './NFTLine';
import { Checkbox } from 'components/UI/Checkbox/Checkbox2';
import { useApi } from 'hooks/useApi';
import { WarningBlock } from 'components/WarningBlock/WarningBlock';
import TokenInputForm from 'pages/CreateNFT/components/TokenInputForm';
import { SetForAllModalType } from 'pages/CreateNFT/components/TokenList';
import { SellTokensModal } from './SellTokensModal';
import { useAccounts } from 'hooks/useAccounts';
import { useNavigate } from 'react-router-dom';

export const MassListing = () => {
  const [tokensForListing, setTokensForListing] = useState<TokenWithPrice[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<number[]>([]);
  const { currentChainId } = useApi();
  const [missingPriceIds, setMissingPriceIds] = useState<number[]>([]);
  const navigate = useNavigate();
  const [isSetForAllModalVisible, setSetForAllModalVisible] = useState(false);

  const [isSellModalVisible, setSellModalVisible] = useState(false);

  const openSellModal = () => setSellModalVisible(true);
  const closeSellModal = () => setSellModalVisible(false);

  const onFinish = () => {};

  const openSetForAllModal = () => setSetForAllModalVisible(true);
  const closeSetForAllModal = () => setSetForAllModalVisible(false);
  const handleSetForAllPrice = (setForAllPrice: string) => {
    setTokensForListing((prevTokens) =>
      prevTokens.map((token) =>
        selectedTokens.includes(token.id) ? { ...token, price: +setForAllPrice } : token
      )
    );
    closeSetForAllModal();
  };

  useEffect(() => {
    const idsWithNoPrice = tokensForListing
      .filter((token) => selectedTokens.includes(token.id) && !token.price)
      .map((token) => token.id);
    setMissingPriceIds(idsWithNoPrice);
  }, [tokensForListing, selectedTokens]);

  useEffect(() => {
    try {
      const savedTokens = localStorage.getItem('tokensForSell');
      if (savedTokens) {
        const parsedTokens: TokenWithPrice[] = JSON.parse(savedTokens);
  
        if (Array.isArray(parsedTokens) && parsedTokens.every((token) => token.id)) {
          setTokensForListing(parsedTokens);
          const allTokenIds = parsedTokens.map((token) => token.id);
          setSelectedTokens(allTokenIds);
        } else {
          console.warn('Invalid tokens found in localStorage. Clearing storage.');
          localStorage.removeItem('tokensForSell');
        }
      }
    } catch (error) {
      console.error('Failed to parse tokens from localStorage:', error);
      localStorage.removeItem('tokensForSell');
    }
  }, []);
  

  const [isScrolledToTop, setIsScrolledToTop] = useState(true);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isTop = element.scrollTop === 0;
    const isBottom = element.scrollHeight - element.scrollTop === element.clientHeight;

    setIsScrolledToTop(isTop);
    setIsScrolledToBottom(isBottom);
  };

  const selectAll = () => {
    const allTokenIds = tokensForListing.map((token) => token.id);
    setSelectedTokens(allTokenIds);
  };

  const deselectAll = () => {
    setSelectedTokens([]);
  };

  const toggleTokenSelection = (tokenId: number) => {
    setSelectedTokens((prevSelected) =>
      prevSelected.includes(tokenId)
        ? prevSelected.filter((id) => id !== tokenId)
        : [...prevSelected, tokenId]
    );
  };

  const isTokenSelected = (tokenId: number) => {
    return selectedTokens.includes(tokenId);
  };

  const handlePriceChange = useCallback((tokenId: number, newPrice: number) => {
    setTokensForListing((prevTokens) =>
      prevTokens.map((token) =>
        token.id === tokenId && token.price !== newPrice ? { ...token, price: newPrice } : token
      )
    );
  }, []);

  const { selectedAccount } = useAccounts();
  const [shouldShowSellModal, setShouldShowSellModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedAccount) {
        setShouldShowSellModal(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAccount]);

  return (
    <PageWrapper>
        <HeaderStyled>
          {'NFTs Mass Listing'}
        </HeaderStyled>
      <TableContainer
        onScroll={handleScroll}
        isScrolledToTop={isScrolledToTop}
        isScrolledToBottom={isScrolledToBottom}
      >
      <TableWrap>
        <TableHeader columnsCount={5}>
          <TableHeaderCell>
            <StyledCheckbox
              label={''}
              checked={selectedTokens.length === tokensForListing.length}
              onChange={(value: boolean) => {
                if (value) {
                  selectAll();
                  return;
                }
                deselectAll();
              }}
              testid='select-all'
            />
          </TableHeaderCell>
          <TableHeaderCell>
            <TextStyled>NFT ID - collection ID</TextStyled>
          </TableHeaderCell>
          <TableHeaderCell>
            <TextStyled>NFT main image</TextStyled>
          </TableHeaderCell>
          {/* <TableHeaderCell>
            <TextStyled>Name</TextStyled>
          </TableHeaderCell> */}
          <TableHeaderCell>
            <TextStyled>Price</TextStyled>

            <SetAllButton
              onClick={openSetForAllModal}
              disabled={!selectedTokens.length}
            >
              Set for selected
            </SetAllButton>
          </TableHeaderCell>
          <TableHeaderCell>
            <TextStyled>Currency</TextStyled>
          </TableHeaderCell>
        </TableHeader>

        {tokensForListing.map((token) => (
          <TokenLineSimple
            key={token.id}
            token={token}
            isSelected={isTokenSelected(token.id)}
            onSelect={toggleTokenSelection}
            onPriceChange={handlePriceChange}
          />
        ))}
      </TableWrap>
      </TableContainer>
      <Button
        title='Sell Tokens'
        onClick={openSellModal}
        disabled={selectedTokens.length === 0 || missingPriceIds.length > 0}
      />
      {selectedTokens.length === 0 && <WarningBlock>No tokens selected</WarningBlock>}
      {missingPriceIds.length > 0 && (
        <WarningBlock>{`Items ${missingPriceIds.join(', ')} are missing prices`}</WarningBlock>
      )}

      {shouldShowSellModal && <SellTokensModal
        isVisible={isSellModalVisible}
        closeModal={() => {
          setSellModalVisible(false);
        }}
        tokensForListing={tokensForListing}
        onFinish={onFinish}
        testid="sell-tokens-modal"
      />}

      {
        isSetForAllModalVisible && (
          <Modal isFlexible={true} isVisible={isSetForAllModalVisible} onClose={closeSetForAllModal}>
            <TokenInputForm
              modalType={SetForAllModalType.PRICE}
              onSubmit={handleSetForAllPrice}
              onClose={closeSetForAllModal}
              onlyNumber={true}
            />
          </Modal>
        )
      }
    </PageWrapper>
  );
};

const TableWrap = styled.div`

`;

const PageWrapper = styled.div`

  .unique-list {
    gap: 0;
  }
  @media screen and (max-width: 768px) {
    margin: 0;
  }

  background: #fff;
  padding: 32px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
`;

export const TableHeader = styled.div<{ columnsCount: number }>`
  display: flex;
  width: ${({ columnsCount }) => `${columnsCount * 240}px`};
  height: 100px;
`;

export const TableHeaderCell = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  background-color: #0000000f;
  border-right: 1px solid var(--color-table-grey);
  border-top: 1px solid var(--color-table-grey);
  height: 100%;
  padding: 18px 0;
  box-sizing: border-box;
  &:first-child {
    flex: 0.5;
    border-left: 1px solid #b9b9b9;
  }
`;

const TextStyled = styled.div`
  text-align: left;
  font-size: 16px;
  line-height: 19px;
  font-weight: 600;
  padding-left: 10px;
`;

const StyledCheckbox = styled(Checkbox)`
  margin: auto;
  margin-top: 22px;
  .checkmark {
    background-color: #fff;
    border: 1px solid #000;
  }
`;

const SetAllButton = styled.div<{ disabled?: boolean }>`
  line-height: 22px;
  font-size: 14px;
  color: ${({ disabled }) =>
    disabled ? 'var(--color-grey-400)' : 'var(--color-primary-500)'};
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  margin-top: 8px;
  padding-left: 10px;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
`;

const TableContainer = styled.div<{
  isScrolledToTop: boolean;
  isScrolledToBottom: boolean;
}>`
  //max-height: 400px;
  overflow-y: scroll;

  max-width: 1200px;
  margin-bottom: 20px;
  border-top: ${({ isScrolledToTop }) =>
    isScrolledToTop ? 'none' : '1px solid var(--color-table-grey)'};
  border-bottom: ${({ isScrolledToBottom }) =>
    isScrolledToBottom ? 'none' : '1px solid var(--color-table-grey)'};
`;

const HeaderStyled = styled.h1`
  font-family: var(--prop-font-family-heading);
  font-weight: 700;
  font-size: 36px;
  text-align: left;
  line-height: 48px;
  margin: 0 0 24px;
`;