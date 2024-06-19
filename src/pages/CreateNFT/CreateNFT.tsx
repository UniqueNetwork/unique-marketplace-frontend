import { FC, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { TokenId, TokenV2ItemForMultipleDto } from '@unique-nft/sdk';

import { Button, Checkbox, Text, useNotifications, Heading } from 'components/UI';
import { ConfirmBtn } from 'components';

import { CollectionSuggest } from './components/CollectionSuggest';
import { TokenList } from './components/TokenList';
import { CreateTokenDialog, NewToken, ViewMode } from './types';
import { CreateTokensDialogs } from './components/CreateTokensDialogs';
import { mapTokensToPayload, mapTokensToPayloadV1, parseInvalidAttributes } from './helpers';
import { UploadFAB } from './components/UploadFAB';
import { CollectionStats } from './components/CollectionStats';
import { StatusTransactionModal, TRANSACTION_STAGE_ENUM } from './components/StatusTransactionModal';
import { AttributeFilterProvider } from './contexts/AttributesFilterContext';
import { MobileFilters } from './components/MobileFilter';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { sleep } from 'utils/helpers';
import { useCreateMultipleTokens } from './hooks/useCreateMultipleTokens';
import { useCollectionGetById } from './hooks/useCollectionGetById';
import { useCollectionGetLastTokenId } from './hooks/useCollectionGetLastTokenId';
import { WrapperContent } from 'pages/CreateCollection/CreateCollection';
import { GQLCollection } from 'api/scanApi/types';
import { WarningBlock } from 'components/WarningBlock/WarningBlock';

export const MAX_MINT_TOKENS = 300;

export const CreateNFTComponent: FC<{ className?: string }> = ({ className }) => {
  const [collection, setCollection] = useState<GQLCollection>();
  const [collectionToSubmit, setCollectionToSubmit] = useState<GQLCollection>();
  const collectionBlockRef = useRef<HTMLDivElement>(null);
  const deviceSize = useDeviceSize();

  const [tokens, setTokens] = useState<NewToken[]>([]);
  const [dialog, setDialog] = useState<CreateTokenDialog>();
  const [isLoadingSubmitResult, setIsLoadingSubmitResult] = useState<boolean>(false);

  const [stage, setStage] = useState<TRANSACTION_STAGE_ENUM>(TRANSACTION_STAGE_ENUM.DONE);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [mintingProgress, setMintingProgress] = useState<number>(0);
  const BIG_BATCH_SIZE = 30;
  const SMALL_BATCH_SIZE = 10;
  const [batchSize, setBatchSize] = useState<number>(BIG_BATCH_SIZE);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.grid);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const { currentChainId, api } = useApi();

  const navigate = useNavigate();
  const { info, error } = useNotifications();
  const {
    selectedAccount,
    accounts: { size: accountsLength }
  } = useAccounts();
  const {
    lastTokenIdDto,
    isFetching: isFetchingLastTokenId,
    refetch: refetchLastTokenId
  } = useCollectionGetLastTokenId(collection?.id);
  const {
    collectionInfo,
    isFetching: isFetchingInfo,
    refetch: refetchCollectionInfo
  } = useCollectionGetById(collection?.id);
  const { tokenId: lastTokenId } = lastTokenIdDto || {};

  const { submitWaitResult } =
    useCreateMultipleTokens();

  const leftTokens = collection?.tokenLimit
    ? collection.tokenLimit - (collection?.tokensCount || 0) - tokens.length
    : 'Unlimited';

  const selected = useMemo(() => {
    return tokens.filter(({ isSelected }) => isSelected);
  }, [tokens]);

  const handleSubmit = async () => {
    if (!collection || !collection?.id || !selectedAccount) {
      return;
    }

    setIsLoadingSubmitResult(true);
    setStage(TRANSACTION_STAGE_ENUM.UPLOADING);
    const uploadedTokens: NewToken[] = [];
    try {
      for (let index = 0; index < tokens.length; index++) {
        setUploadProgress(index);
        await sleep(100);
        const ipfsCid = await api?.collection?.uploadFile(tokens[index].image.file);
        uploadedTokens.push({
          ...tokens[index],
          ipfsCid
        });
      }
    } catch (e: any) {
      error(e.message);
    }
    setStage(TRANSACTION_STAGE_ENUM.MINTING);

    let createTokensPayload;
    const schemaVersion = collectionInfo?.info?.originalSchemaVersion;

    if (schemaVersion === '1.0.0') {
      if (!collection.properties) return;
      createTokensPayload = mapTokensToPayloadV1(uploadedTokens, collection.properties);
    } else {
      createTokensPayload = mapTokensToPayload(
        uploadedTokens,
        collectionInfo?.info?.potential_attributes
      );
    }

    const submitBatch = async (_tokens: TokenV2ItemForMultipleDto[]) => {
      return await submitWaitResult({
        payload: {
          tokens: _tokens,
          collectionId: collection?.id
        },
        schemaVersion
      });
    };

    let tokensCreated: TokenId[] = [];
    let currentPos = 0;
    let reentryCounter = 0;
    while (currentPos < createTokensPayload.length && reentryCounter <= (MAX_MINT_TOKENS / batchSize)) {
      reentryCounter++;
      try {
        setMintingProgress(currentPos);
        const result = await submitBatch(createTokensPayload.slice(currentPos, currentPos + batchSize));
        if (!result) return;
        tokensCreated = tokensCreated.length > 0 ? [...tokensCreated, ...result] : [...result];
        
        currentPos += batchSize;
      } catch (e: any) {
        if (e.message === "Cancelled") {
          currentPos = createTokensPayload.length;
          setStage(TRANSACTION_STAGE_ENUM.FAILED);
          setIsLoadingSubmitResult(false);
        } else {
          setBatchSize(SMALL_BATCH_SIZE);
        }
      }
    }

    if (tokensCreated.length > 0) {
      await refetchLastTokenId();
      await refetchCollectionInfo();
      setStage(TRANSACTION_STAGE_ENUM.DONE);
      info(`${tokensCreated.length} tokens created successfully`);
    } else {
      error('Create tokens error');
      setStage(TRANSACTION_STAGE_ENUM.FAILED);
    }
  };

  const onAddTokens = (files: File[]) => {
    const maxTokens = Math.min(
      MAX_MINT_TOKENS - tokens.length,
      leftTokens !== 'Unlimited' ? leftTokens : MAX_MINT_TOKENS
    );
    if (files.length > maxTokens) {
      setDialog(CreateTokenDialog.exceededTokens);
      return;
    }
    const lastId =
      (tokens.sort(({ tokenId: idA }, { tokenId: idB }) => (idA > idB ? 1 : -1)).at(-1)
        ?.tokenId ||
        lastTokenId ||
        0) + 1;
    setTokens([
      ...tokens,
      ...files.map((file, index) => ({
        id: index + lastId,
        tokenId: index + lastId,
        image: {
          url: URL.createObjectURL(file),
          file
        },
        attributes: [],
        isValid: true,
        isSelected: false
      }))
    ]);
    info(`${files.length} files added`);
  };

  const onChangeCollection = (_collection: GQLCollection) => {
    if (_collection === collection) {
      return;
    }
    if (!collection || tokens.length === 0) {
      setCollection(_collection);

      const rect = collectionBlockRef.current?.getBoundingClientRect();
      const top = rect?.top;
      window.scrollTo({ top, behavior: 'smooth' });
      return;
    }
    setCollectionToSubmit(_collection);
    setDialog(CreateTokenDialog.changeCollection);
  };

  const selectedAll = () => {
    setTokens(tokens.map((token) => ({ ...token, isSelected: true })));
  };

  const deselectedAll = () => {
    setTokens(tokens.map((token) => ({ ...token, isSelected: false })));
  };

  const changeSelected = (selectedTokens: NewToken[]) => {
    setTokens(
      tokens.map((token) => {
        const selectedToken = selectedTokens.find(({ id }) => id === token.id);
        return selectedToken || token;
      })
    );
  };

  const removeSelected = () => {
    setTokens(
      tokens
        .filter(({ isSelected }) => !isSelected)
        .map((token, index) => ({ ...token, tokenId: (lastTokenId || 0) + index + 1 }))
    );
    info(`${selected.length} files removed`);
  };

  const onConfirmDialog = () => {
    if (dialog === CreateTokenDialog.removeToken) {
      removeSelected();
      setDialog(undefined);
    }
    if (dialog === CreateTokenDialog.changeCollection) {
      setCollection(collectionToSubmit);
      setDialog(undefined);
    }
  };

  useEffect(() => {
    setTokens((tokens) =>
      tokens.map((token, index) => ({
        ...token,
        tokenId: (lastTokenId || 0) + index + 1
      }))
    );
  }, [lastTokenId]);

  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const actionBoxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const intercept = document.createElement('div');

    intercept.setAttribute('data-observer-intercept', '');
    mainWrapperRef.current?.after(intercept);

    const observer = new IntersectionObserver(([entry]) => {
      actionBoxRef.current?.classList.toggle('active', !entry.isIntersecting);
    });

    observer.observe(intercept);
  }, []);

  const onChangeView = (viewMode: ViewMode) => () => {
    setViewMode(viewMode);
  };

  const invalidTokenList = useMemo(() => {
    if (!collection?.properties) return [];

    const invalidTokens = parseInvalidAttributes(
      tokens,
      collection?.properties
    );
    return invalidTokens;
  }, [tokens, collection]);

  return (
    <AttributeFilterProvider>
      <MainWrapper className='create-nft-page' ref={mainWrapperRef}>
        <WrapperCollectionContentStyled expanded={!!collection}>
          <Heading size='3'>Choose a collection</Heading>
          <CollectionBlock ref={collectionBlockRef}>
            <CollectionSuggest
              collection={collection}
              onChange={onChangeCollection}
            />
            {collection && (
              <CollectionStats
                collection={collection}
                isFetching={isFetchingInfo || isFetchingLastTokenId}
                nestingPermissions={collectionInfo?.permissions?.nesting}
                sponsorship={collectionInfo?.sponsorship}
                tokensLeft={leftTokens}
                tokensLimit={collection.tokenLimit || 0}
                lastTokenId={lastTokenId || 0}
              />
            )}
          </CollectionBlock>
        </WrapperCollectionContentStyled>
        <WrapperTokenListContentStyled disabled={!collection}>
          <Heading size='3'>Create NFTs</Heading>
          <Text size='m' color='grey-500'>
            You can mass-mint {MAX_MINT_TOKENS} tokens using JPEG, PNG, and GIF
            files, with a maximum size of 10MB each
          </Text>
          {tokens.length > 0 && (
            <TokensCounterWrapper>
              <Text color='grey-500' weight='bold' size='m'>
                {tokens.length} / {MAX_MINT_TOKENS}
              </Text>
              <Button
                title=''
                role='ghost'
                iconLeft={{
                  color:
                    viewMode === ViewMode.grid
                      ? 'var(--color-primary-500)'
                      : 'currentColor',
                  name: 'grid',
                  size: 32
                }}
                onClick={onChangeView(ViewMode.grid)}
              />
              <Button
                title=''
                role='ghost'
                iconLeft={{
                  color:
                    viewMode === ViewMode.list
                      ? 'var(--color-primary-500)'
                      : 'currentColor',
                  name: 'list',
                  size: 32
                }}
                onClick={onChangeView(ViewMode.list)}
              />
            </TokensCounterWrapper>
          )}
          <TokenList
            viewMode={viewMode}
            tokenPrefix={collection?.tokenPrefix || ''}
            attributesSchema={collectionInfo?.info?.potential_attributes || []}
            mode={collection?.mode}
            tokensLimit={collection?.tokenLimit}
            tokensStartId={lastTokenId}
            tokens={tokens}
            disabled={!collection}
            schemaVersion={collectionInfo?.info?.originalSchemaVersion || '2.0.0'}
            onChange={setTokens}
            onAddTokens={onAddTokens}
          />
          {tokens.length > 0 && !isFilterVisible && (
            <ButtonGroup ref={actionBoxRef}>
              {invalidTokenList.length > 0 && (
                <WarningBlock>
                  {invalidTokenList.map(({ token, invalidAttributes }) => (
                    <div key={'token_validation_item_' + token.image.url}>
                      Set properties{' '}
                      {invalidAttributes.map((property, index) => (
                        <span key={'token_validation_property_' + token.image.url + '_' + index}>
                          {index ? ', ' : ''}
                          {collectionInfo?.info?.potential_attributes &&
                            collectionInfo?.info?.potential_attributes[property]
                              .trait_type}
                        </span>
                      ))}{' '}
                      to token {collectionInfo?.tokenPrefix}#{token.id}
                    </div>
                  ))}
                </WarningBlock>
              )}
              <ButtonConatiner>
                <Button
                  title={
                    <StyledCheckbox
                      label={
                        <Text color='grey-500'>
                          {selected.length
                            ? `${selected.length} selected`
                            : 'Select all'}
                        </Text>
                      }
                      checked={selected.length > 0}
                      onChange={(value: boolean) => {
                        if (value) {
                          selectedAll();
                          return;
                        }
                        deselectedAll();
                      }}
                      testid='select-all'
                    />
                  }
                  onClick={() => {
                    if (selected.length > 0) {
                      deselectedAll();
                      return;
                    }
                    selectedAll();
                  }}
                />
                {deviceSize <= DeviceSize.sm && (
                  <ConfirmBtn
                    role='outlined'
                    title='Filter'
                    onClick={() => setIsFilterVisible(true)}
                  />
                )}
                <ConfirmBtn
                  className={selected.length > 1 ? 'visible' : 'hidden'}
                  role='outlined'
                  disabled={selected.length === 0}
                  title='Modify selected'
                  onClick={() => setDialog(CreateTokenDialog.editAttributes)}
                />
                <ConfirmBtn
                  className={selected.length > 1 ? 'visible' : 'hidden'}
                  role='danger'
                  disabled={selected.length === 0}
                  title='Remove selected'
                  onClick={() => setDialog(CreateTokenDialog.removeToken)}
                />
                <SelectedCountWrapper />
                <ConfirmBtn
                  disabled={
                    !collection ||
                    tokens.length === 0 ||
                    invalidTokenList.length > 0
                  }
                  role='primary'
                  title='Confirm and create all'
                  onClick={handleSubmit}
                />
                {tokens.length > 0 && Number(leftTokens) > 0 && (
                  <UploadFAB onUpload={onAddTokens} />
                )}
              </ButtonConatiner>
            </ButtonGroup>
          )}
        </WrapperTokenListContentStyled>

        <CreateTokensDialogs
          dialog={dialog}
          tokens={selected}
          tokenPrefix={collection?.tokenPrefix || ''}
          leftTokens={leftTokens}
          attributesSchema={collectionInfo?.info?.potential_attributes || []}
          mode={collection?.mode}
          schemaVersion={collectionInfo?.info?.originalSchemaVersion || '2.0.0'}
          onClose={() => setDialog(undefined)}
          onChange={changeSelected}
          onConfirm={onConfirmDialog}
        />
        <StatusTransactionModal
          isVisible={isLoadingSubmitResult}
          stage={stage}
          uploadingProgress={uploadProgress}
          mintingProgress={mintingProgress}
          totalTokens={tokens.length}
          batchSize={batchSize}
          onComplete={() => {
            navigate(`/${currentChainId}/sellTokens`);
          }}
          onContinue={() => {
            setTokens([]);
            setUploadProgress(0);
            setMintingProgress(0);
            setIsLoadingSubmitResult(false);
            setStage(TRANSACTION_STAGE_ENUM.UPLOADING);
          }}
        />
        <MobileFilters
          isVisible={isFilterVisible}
          setIsVisible={setIsFilterVisible}
        />
      </MainWrapper>
    </AttributeFilterProvider>
  );
};

export const MainWrapper = styled.div`
  @media screen and (min-width: 1025px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .unique-modal-content-wrapper {
    max-width: fit-content;
    width: auto;
  }
`;

const CollectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--prop-gap);
  align-items: flex-start;
  max-width: 1000px;
  @media screen and (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const WrapperCollectionContentStyled = styled(WrapperContent)<{ expanded: boolean }>`
  margin-bottom: calc(var(--prop-gap) * 2.5);
  width: 100%;
  max-height: ${({ expanded }) => (expanded ? '1000px' : '154px')};
  transition: 0.5s;
  @media screen and (min-width: 1025px) {
    margin-bottom: 0;
  }
`;

const WrapperTokenListContentStyled = styled(WrapperContent)<{ disabled: boolean }>`
  margin: calc(var(--prop-gap) * 2) 0;
  width: 100%;
  opacity: ${({ disabled }) => (disabled ? '0.7' : '1')};
  position: relative;
  transition: 0.5s;
  h3.unique-font-heading.size-3 {
    margin-bottom: 0;
  }
  @media screen and (min-width: 1025px) {
    margin-bottom: 0;
  }
`;

const TokensCounterWrapper = styled.div`
  position: absolute;
  right: 32px;
  top: 32px;
  display: flex;
  align-items: center;
  gap: var(--prop-gap);

  button.unique-button.ghost {
    padding: 0;
    svg {
      margin: 0;
    }
  }

  @media screen and (max-width: 1024px) {
    top: 0px;
    right: 0px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--prop-gap);
  box-sizing: border-box;
  padding: calc(var(--prop-gap) * 2);
  margin: -32px;
  bottom: 0px;
  z-index: 49;
  background: white;
  position: sticky;
  border-radius: 4px;
  &.active {
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  }
  button {
    transition: 0.2s;
    &.visible {
      visibility: visible;
      opacity: 1;
    }
    &.hidden {
      visibility: hidden;
      opacity: 0;
    }
  }
`;

const SelectedCountWrapper = styled.div`
  flex: .8;
  display: flex;
  align-items: center;
`;

const SelectCheckbox = styled(Checkbox)`
  align-items: center;
  &.unique-checkbox-wrapper.checkbox-size-s span.checkmark {
    height: 32px;
    width: 32px;
    border-radius: var(--prop-gap);
    background-color: var(--color-primary-300);
    &.checked {
      background-color: var(--color-primary-500);
    }
  }
  label.checkbox-label {
    margin-left: 42px;
  }
`;

const StyledCheckbox = styled(Checkbox)`
  align-items: center;
  margin-left: -14px;
  label.checkbox-label {
    margin-left: 42px;
  }
`;

const ButtonConatiner = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;

  @media screen and (max-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 10px;
    & > button:last-of-type {
      grid-column: 1 / span 2;
    }
  }
  @media screen and (max-width: 568px) {
    gap: calc(var(--prop-gap) / 2);
    & > button.unique-button.size-middle {
      padding: 8px 16px;
    }
  }
`;

export const CreateNFT = CreateNFTComponent;
