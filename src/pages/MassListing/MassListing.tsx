import { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Button, Modal } from 'components/UI';
import { TokenLineSimple, TokenWithPrice } from './NFTLine';
import { Checkbox } from 'components/UI/Checkbox/Checkbox2';
import { useApi } from 'hooks/useApi';
import { WarningBlock } from 'components/WarningBlock/WarningBlock';
import TokenInputForm from 'pages/CreateNFT/components/TokenInputForm';
import { SetForAllModalType } from 'pages/CreateNFT/components/TokenList';
import { SellTokensModal } from './SellTokensModal';

export const MassListing = () => {
  const [tokensForListing, setTokensForListing] = useState<TokenWithPrice[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<number[]>([]);
  const { api } = useApi();
  const marketApi = api?.market;
  const [missingPriceIds, setMissingPriceIds] = useState<number[]>([]);
  const [isSetForAllModalVisible, setSetForAllModalVisible] = useState(false);
  //const [setForAllPrice, setSetForAllPrice] = useState<number | undefined>();
  const [isSellModalVisible, setSellModalVisible] = useState(false);

  const openSellModal = () => setSellModalVisible(true);
  const closeSellModal = () => setSellModalVisible(false);


  const openSetForAllModal = () => setSetForAllModalVisible(true);
  const closeSetForAllModal = () => setSetForAllModalVisible(false);
  const handleSetForAllPrice = (setForAllPrice: string) => {
    console.log('SET_FOR_ALL', setForAllPrice)

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
    const savedTokens = localStorage.getItem('tokensForSell');
    if (savedTokens) {
      const parsedTokens: TokenWithPrice[] = JSON.parse(savedTokens);
      setTokensForListing(parsedTokens);

      const allTokenIds = parsedTokens.map((token) => token.id);
      setSelectedTokens(allTokenIds);
    }
  }, []);

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

  return (
    <DraggableContainer hasOffset={false}>
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
            <TextStyled>NFT ID</TextStyled>
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
      {selectedTokens.length === 0 && <WarningBlock>No tokens selected</WarningBlock>}
      {missingPriceIds.length > 0 && (
        <WarningBlock>{`Items ${missingPriceIds.join(', ')} are missing prices`}</WarningBlock>
      )}

      <Button
        title='Sell Tokens'
        onClick={openSellModal}
        disabled={selectedTokens.length === 0 || missingPriceIds.length > 0}
      />
      <SellTokensModal
        isVisible={isSellModalVisible}
        tokensForListing={tokensForListing}
        onFinish={closeSellModal}
        testid="sell-tokens-modal"
      />

      {
        isSetForAllModalVisible && (
          <Modal isVisible={isSetForAllModalVisible} onClose={closeSetForAllModal}>
            <TokenInputForm
              modalType={SetForAllModalType.PRICE}
              onSubmit={handleSetForAllPrice}
              onClose={closeSetForAllModal}
            />
          </Modal>
        )
      }

    </DraggableContainer>
  );
};

const TableWrap = styled.div`
  background: #fff;
`;

const DraggableContainer = styled.div<{ hasOffset: boolean }>`
  margin: ${({ hasOffset }) => (hasOffset ? '0 -32px' : '0')};
  & > div {
    width: 100%;
    padding-bottom: 10px !important;
  }
  .unique-list {
    gap: 0;
  }
  @media screen and (max-width: 768px) {
    margin: 0;
  }
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