import { FCC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { TokenId, TokenV2ItemForMultipleDto } from '@unique-nft/sdk';

import { Button, Checkbox, Text, useNotifications, Heading } from 'components/UI';
import { ConfirmBtn } from 'components';

import { TokenList } from './components/TokenList';
import { CreateTokenDialog, NewToken2, ViewMode } from './types';
import { mapTokensToPayload } from './helpers';
import { StatusTransactionModal, TRANSACTION_STAGE_ENUM } from './components/StatusTransactionModal';
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
import { RoyaltiesForm } from 'pages/CollectionEdit/Forms/RoyaltiesForm';
import { RoyaltiesFormData } from 'pages/CollectionEdit/types';
import { CreateNFT_V1 } from './CreateNFT_V1';
import Box from 'static/images/box.png';

import { useCollections } from 'hooks/useCollections';
import { PagePaper } from 'components/PagePaper/PagePaper';
import CollectionsComponent from './CollectionsComponent';
import { CollectionDetail } from 'pages/Collection/CollectionDetail/CollectionDetail';
import { CollectionDetailLight } from 'pages/Collection/CollectionDetail/CollectionDetailLight';
import Skeleton from 'components/Skeleton/Skeleton';
import { CreateTokensDialogs } from './components/CreateTokensDialogs';
import { RoyaltiesFormNew } from 'pages/CollectionEdit/Forms/RoyaltiesFormNew';
import { validateLink } from 'utils/textUtils';
import { UploadFAB } from './components/UploadFAB';
import { WarningBlock } from 'components/WarningBlock/WarningBlock';
import { filesSizeValidate } from 'utils/filesSizeValidate';

export enum CreateTokensSteps {
  SELECT_COLLECTION = 'SELECT_COLLECTION',
  UPLOAD_IMAGES = 'UPLOAD_IMAGES',
  UPLOAD_MEDIA = 'UPLOAD_MEDIA',
  SET_DATA = 'SET_DATA',
  SET_ROYALTIES = 'SET_ROYALTIES',
  PREVIEW_WITH_FILTERS = 'PREVIEW_WITH_FILTERS'
}

export const MAX_MINT_TOKENS = 50;

export const CreateNFTComponent: FCC<{ className?: string }> = ({
  className
}) => {
  const [collection, setCollection] = useState<GQLCollection>();
  const [collectionToSubmit, setCollectionToSubmit] = useState<GQLCollection>();
  const collectionBlockRef = useRef<HTMLDivElement>(null);
  const deviceSize = useDeviceSize();

  const [tokens, setTokens] = useState<NewToken2[]>([]);
  //disable cache in Local storage
  // useEffect(() => {
  //   if (tokens.length === 0) return;
  //   localStorage.setItem('cachedTokens', JSON.stringify(tokens));
  //   localStorage.setItem('cachedCollection', JSON.stringify(collection));
  // }, [tokens, collection]);

  // useEffect(() => {
  //   const cachedTokens = localStorage.getItem('cachedTokens');
  //   const cachedCollection = localStorage.getItem('cachedCollection');
  //   if (cachedTokens) {
  //     setTokens(JSON.parse(cachedTokens));
  //     cachedCollection && (setCollection(JSON.parse(cachedCollection)));
  //     setStep(CreateTokensSteps.UPLOAD_MEDIA);
  //   }
  // }, []);
  const deleteCachedTokens = () => {
    localStorage.removeItem('cachedTokens');
  };
  const [dialog, setDialog] = useState<CreateTokenDialog>();
  const [isLoadingSubmitResult, setIsLoadingSubmitResult] =
    useState<boolean>(false);

  const [stage, setStage] = useState<TRANSACTION_STAGE_ENUM>(
    TRANSACTION_STAGE_ENUM.DONE
  );
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [mintingProgress, setMintingProgress] = useState<number>(0);
  const BIG_BATCH_SIZE = 30;
  const SMALL_BATCH_SIZE = 10;
  const [batchSize, setBatchSize] = useState<number>(BIG_BATCH_SIZE);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.list);
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

  const { submitWaitResult } = useCreateMultipleTokens();

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
    const uploadedTokens: NewToken2[] = [];
    try {
      for (let index = 0; index < tokens.length; index++) {
        setUploadProgress(index);
        await sleep(100);
        const ipfsCid = await api?.collection?.uploadFile(
          tokens[index].image.file
        );

        let animationURLIpfsCid;
        
        if (tokens[index]?.media && tokens[index].media.length > 0) {
          for (const media of tokens[index].media) {
            if (media?.file) {
              media.ipfsCid = await api?.collection?.uploadFile(media.file);
            }
          }
        }

        uploadedTokens.push({
          ...tokens[index],
          external_url: validateLink(tokens[index].external_url || '') ? tokens[index].external_url : '',
          ipfsCid,
          animationURLIpfsCid,
          media: tokens[index].media,
          royalties:
            royalty.royalties.length > 0 ? royalty.royalties : undefined
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
      throw new Error('Schema not support');
    } else {
      createTokensPayload = mapTokensToPayload(uploadedTokens);
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
    while (
      currentPos < createTokensPayload.length &&
      reentryCounter <= MAX_MINT_TOKENS / batchSize
    ) {
      reentryCounter++;
      try {
        setMintingProgress(currentPos);
        const result = await submitBatch(
          createTokensPayload.slice(currentPos, currentPos + batchSize)
        );
        if (!result) return;
        tokensCreated =
          tokensCreated.length > 0
            ? [...tokensCreated, ...result]
            : [...result];

        currentPos += batchSize;
      } catch (e: any) {
        if (e.message === 'Cancelled') {
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
      //TO DO - remove to sell stage after it implemention
      deleteCachedTokens();
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

    const validFiles = filesSizeValidate({ fileArray: files, withoutTotalMax: true });
    if (!validFiles) return;

    const lastId =
      (tokens
        .sort(({ tokenId: idA }, { tokenId: idB }) => (idA > idB ? 1 : -1))
        .at(-1)?.tokenId ||
        lastTokenId ||
        0) + 1;
    setTokens([
      ...tokens,
      ...validFiles.map((file, index) => ({
        id: index + lastId,
        tokenId: index + lastId,
        image: {
          url: URL.createObjectURL(file),
          file
        },
        attributes: [],
        isValid: true,
        isSelected: false,
        media: []
      }))
    ]);
    info(`${validFiles.length} files added`);
    setStep(CreateTokensSteps.UPLOAD_MEDIA);
  };

  const selectedAll = () => {
    setTokens(tokens.map((token) => ({ ...token, isSelected: true })));
  };

  const deselectedAll = () => {
    setTokens(tokens.map((token) => ({ ...token, isSelected: false })));
  };

  const changeSelected = (selectedTokens: NewToken2[]) => {
    setTokens(
      tokens.map((token) => {
        const selectedToken = selectedTokens.find(({ id }) => id === token.id);
        return selectedToken || token;
      })
    );
    setStep(CreateTokensSteps.UPLOAD_MEDIA);
  };

  const removeSelected = () => {
    const newTokens = tokens.filter(({ isSelected }) => !isSelected);
  
    setTokens(
      newTokens.map((token, index) => ({
        ...token,
        tokenId: (lastTokenId || 0) + index + 1
      }))
    );
  
    if (newTokens.length === 0) {
      setStep(CreateTokensSteps.UPLOAD_IMAGES);
    }
  
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

  const [step, setStep] = useState(CreateTokensSteps.SELECT_COLLECTION);
  const [nextStepIsBlocked, setNextStepIsBlocked] = useState(false);

  const changeStep = (direction: 'next' | 'prev') => {
    if (
      !(
        (step === CreateTokensSteps.UPLOAD_MEDIA && direction == 'next')
        || (step === CreateTokensSteps.SET_DATA && direction == 'prev')
      )
    ) {
      setTokens((tokens) =>
        tokens.map((token) => ({
          ...token,
          isSelected: false,
        }))
      );
    }

    setStep((currentStep) => {
      switch (currentStep) {
        case CreateTokensSteps.UPLOAD_IMAGES:
          return direction === 'next'
            ? CreateTokensSteps.UPLOAD_MEDIA
            : CreateTokensSteps.UPLOAD_MEDIA;
        case CreateTokensSteps.UPLOAD_MEDIA:
          return direction === 'next'
            ? CreateTokensSteps.SET_DATA
            : CreateTokensSteps.PREVIEW_WITH_FILTERS;
        case CreateTokensSteps.SET_DATA:
          return direction === 'next'
            ? CreateTokensSteps.SET_ROYALTIES
            : CreateTokensSteps.UPLOAD_MEDIA;
        case CreateTokensSteps.SET_ROYALTIES:
          return direction === 'next'
            ? CreateTokensSteps.PREVIEW_WITH_FILTERS
            : CreateTokensSteps.SET_DATA;
        case CreateTokensSteps.PREVIEW_WITH_FILTERS:
          return direction === 'next'
            ? CreateTokensSteps.SET_ROYALTIES
            : CreateTokensSteps.SET_ROYALTIES;
        default:
          throw new Error('Invalid step');
      }
    });
  };

  const [royalty, setRoyalty] = useState<RoyaltiesFormData>({ royalties: [] });

  useEffect(() => {
    //@ts-ignore
    setTokens((tokens) =>
      tokens.map((token) => ({
        ...token,
        royalties: royalty.royalties.map(({ value, address }) => ({
          percent: value,
          address
        }))
      }))
    );
  }, [royalty]);
  const onRoyaltiesFormSubmit = useCallback((royalty: RoyaltiesFormData) => {
    setRoyalty(royalty);
  }, []);
  const { collections, isFetching, fetchCollections } = useCollections();
  useEffect(() => {
    void fetchCollections(selectedAccount);
  }, [fetchCollections, selectedAccount]);

  const isValidTotalRoyalty = useMemo(() => {
    const totalRoyalty = royalty.royalties.reduce((acc, { value }) => Number(acc) + Number(value), 0);
    return totalRoyalty <= 99;
  }, [royalty]);

  return (
    <MainWrapper className='create-nft-page' ref={mainWrapperRef}>
      {
        <HeaderStyled>
          {step === CreateTokensSteps.SELECT_COLLECTION
            ? 'Select collection'
            : 'Mint NFTs'}
        </HeaderStyled>
      }
      {step === CreateTokensSteps.SELECT_COLLECTION && (
        <>
          <WrapperCollectionContentStyled expanded={!!collection}>
            <ImageCreate src={Box} />
            <Heading size='3'>
              {!isFetching ? (collections.length > 0 ? 'Create new collection or select an existing one' : 'You don`t own any collections yet, but you can create one right now!') : 'Loading collection list'}
            </Heading>
            <Button
              role='primary'
              title={'Create collection'}
              onClick={() => {
                navigate(`/${currentChainId}/create-collection/`, {
                  state: {
                    returnToCreateToken: true
                  }
                });
              }}
            />
          </WrapperCollectionContentStyled>
          {collections.length > 0 && (
            <PagePaperStyled>
              <CollectionsComponent
                collections={collections}
                emitSelectCollection={(collection) => {
                  setCollection(collection);
                  setStep(CreateTokensSteps.UPLOAD_IMAGES);
                }}
              ></CollectionsComponent>
            </PagePaperStyled>
          )}
          {isFetching && (
            <PagePaperStyled>
              <Skeleton width={'100%'} height={'calc(400px - var(--prop-gap)* 2)'} />
            </PagePaperStyled>
          )}
        </>
      )}
      {(step === CreateTokensSteps.UPLOAD_IMAGES ||
        step === CreateTokensSteps.UPLOAD_MEDIA ||
        step === CreateTokensSteps.SET_DATA ||
        step === CreateTokensSteps.SET_ROYALTIES ||
        step === CreateTokensSteps.PREVIEW_WITH_FILTERS) && (
        <>
          {collectionInfo?.info?.originalSchemaVersion === '1.0.0' ? (
            <CreateNFT_V1 collection={collection} />
          ) : (
            <>
              <WrapperTokenListContentStyled disabled={!collection}>
                <CollectionDetailLight collection={collection} />
                {step === CreateTokensSteps.UPLOAD_IMAGES && (
                  <ContentWrap>
                    <Heading size='3'>NFT images</Heading>
                    <Text size='m' color='grey-500'>
                      These are images people will see when browsing NFTs in
                      wallets and marketplaces.
                    </Text>
                  </ContentWrap>
                )}
                {step === CreateTokensSteps.UPLOAD_MEDIA && (
                  <ContentWrap>
                    <Heading size='3'>NFT Media</Heading>
                    <Text size='m' color='grey-500'>
                      Only the main image is mandatory. You can add more media
                      files—they will be displayed on our marketplace. Check
                      compatibility with other platforms where you plan to
                      showcase your NFTs.
                    </Text>
                  </ContentWrap>
                )}
                {step === CreateTokensSteps.SET_DATA && (
                  <ContentWrap>
                    <Heading size='3'>NFT Attributes</Heading>
                    <Text size='m' color='grey-500'>
                      NFT attributes are unique characteristics that define and
                      differentiate an NFT within a collection. These attributes
                      can include visual aspects like color or traits, as well
                      as non-visual details such as rarity levels, artists’
                      info, utility description, and links to external content.
                    </Text>
                  </ContentWrap>
                )}
                {step === CreateTokensSteps.SET_ROYALTIES && (
                  <ContentWrap>
                    <Heading size='3'>Royalty</Heading>
                    <Text size='s' color='grey-500'>
                      Royalties are payments made to the collection&apos;s creator of team whenever an NFT is resold on the secondary market. 
                    </Text>
                  </ContentWrap>
                )}
                {step === CreateTokensSteps.PREVIEW_WITH_FILTERS && (
                  <ContentWrap>
                    <Heading size='3'>Check final NFTs before minting</Heading>
                    <Text size='m' color='grey-500'>
                      Review your NFTs before minting. Check the names and
                      values of attributes, the list of media files, and ensure
                      they match the main NFT image.
                    </Text>
                  </ContentWrap>
                )}
                {tokens.length > 0 && (
                  <TokensCounterWrapper>
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
                {(step === CreateTokensSteps.UPLOAD_IMAGES ||
                  step === CreateTokensSteps.UPLOAD_MEDIA ||
                  step === CreateTokensSteps.SET_DATA ||
                  step === CreateTokensSteps.PREVIEW_WITH_FILTERS) && (
                  <ContentWrap>
                    <TokenList
                      viewMode={
                        step === CreateTokensSteps.PREVIEW_WITH_FILTERS
                          ? ViewMode.grid
                          : ViewMode.list
                      }
                      tokenPrefix={collection?.tokenPrefix || ''}
                      attributesSchema={
                        collectionInfo?.info?.potential_attributes || []
                      }
                      mode={collection?.mode}
                      tokensLimit={collection?.tokenLimit}
                      tokensStartId={lastTokenId}
                      tokens={tokens}
                      disabled={!collection}
                      step={step}
                      collection={collectionInfo || undefined}
                      schemaVersion={
                        collectionInfo?.info?.originalSchemaVersion || '2.0.0'
                      }
                      onChange={setTokens}
                      onAddTokens={onAddTokens}
                      selected={selected}
                      selectedAll={selectedAll}
                      deselectedAll={deselectedAll}
                    />
                  </ContentWrap>
                )}
                {step === CreateTokensSteps.SET_ROYALTIES && (
                  <RoyaltiesFormWrapper>
                    {' '}
                    <RoyaltiesFormNew
                      initialFormData={royalty.royalties}
                      onSubmit={onRoyaltiesFormSubmit}
                      withSaveButton={false}
                    />
                  </RoyaltiesFormWrapper>
                )}
                {tokens.length > 0 && !isFilterVisible && (
                  <ButtonGroup ref={actionBoxRef}>
                    {!isValidTotalRoyalty && <WarningBlock margin={0.5}>Max total royalty: 99%</WarningBlock>}
                    <ButtonConatiner>
                      {step !== CreateTokensSteps.UPLOAD_MEDIA && <ConfirmBtn
                        iconLeft={{
                          color: 'var(--color-primary-400)',
                          name: 'arrow-left',
                          size: 12
                        }}
                        role='outlined'
                        title='Back'
                        disabled={!isValidTotalRoyalty}
                        onClick={() => changeStep('prev')}
                      />}
                      {step === CreateTokensSteps.PREVIEW_WITH_FILTERS ? (
                        <ConfirmBtn
                          disabled={!collection || tokens.length === 0 || !isValidTotalRoyalty}
                          role='primary'
                          title='Confirm and create all'
                          onClick={handleSubmit}
                        />
                      ) : (<ConfirmBtn
                        iconRight={{
                          color: 'currentColor',
                          name: 'arrow-right',
                          size: 12
                        }}
                        role='primary'
                        title='Next Step'
                        disabled={nextStepIsBlocked || !isValidTotalRoyalty}
                        onClick={() => changeStep('next')}
                      />)}
                      <RemoveButtonWrap>
                        <ConfirmBtn
                          className={selected.length >= 1 ? 'visible' : 'hidden'}
                          role='danger'
                          disabled={selected.length === 0}
                          title='Remove selected'
                          onClick={() => setDialog(CreateTokenDialog.removeToken)}
                        />
                      </RemoveButtonWrap>
                    </ButtonConatiner>
                    {tokens.length > 0 &&
                      Number(leftTokens) > 0 &&
                      (step === CreateTokensSteps.SET_DATA ||
                        step === CreateTokensSteps.UPLOAD_MEDIA) && (
                        <UploadFAB onUpload={onAddTokens} />
                      )}
                  </ButtonGroup>
                )}
              </WrapperTokenListContentStyled>
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
                  setStep(CreateTokensSteps.UPLOAD_IMAGES);
                }}
              />
              <MobileFilters
                isVisible={isFilterVisible}
                setIsVisible={setIsFilterVisible}
              />
              <CreateTokensDialogs
                dialog={dialog}
                tokens={selected}
                tokenPrefix={collection?.tokenPrefix || ''}
                leftTokens={leftTokens}
                attributesSchema={
                  collectionInfo?.info?.potential_attributes || []
                }
                mode={collection?.mode}
                schemaVersion={
                  collectionInfo?.info?.originalSchemaVersion || '2.0.0'
                }
                onClose={() => setDialog(undefined)}
                onChange={changeSelected}
                onConfirm={onConfirmDialog}
              />
            </>
          )}
        </>
      )}
    </MainWrapper>
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

const WrapperCollectionContentStyled = styled(WrapperContent)<{
  expanded: boolean;
}>`
  margin-bottom: calc(var(--prop-gap) * 2.5);
  width: 100%;
  height: 236px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: 0.5s;

  @media screen and (min-width: 1025px) {
    margin-bottom: 0;
  }
`;
// calc(167px + var(--prop-gap)* 2)
const WrapperTokenListContentStyled = styled(WrapperContent)<{
  disabled: boolean;
}>`
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
  flex-direction: column;
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
  padding-bottom: 64px;

  @media screen and (min-width: 1025px) {
    padding-left: calc(220px + var(--prop-gap)* 2);
  }

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




const ButtonConatiner = styled.div`
  display: flex;
  justify-content: start;
  gap: 16px;
`;

const RoyaltiesFormWrapper = styled.div`
  width: 800px;

  @media screen and (min-width: 1025px) {
    padding-left: calc(198px + var(--prop-gap) * 2);
  }
`;

const ImageCreate = styled.img`
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
`;

const PagePaperStyled = styled(PagePaper)`
  width: 100%;
  min-height: 400px;
  box-sizing: border-box;
  border-radius: 0;
  margin-top: 34px;
`;

const HeaderStyled = styled.h1`
  font-family: var(--prop-font-family-heading);
  font-weight: 700;
  font-size: 36px;
  text-align: center;
  line-height: 48px;
  margin: 0 0 24px;
`;

const ContentWrap = styled.div`
  @media screen and (min-width: 1025px) {
    padding-left: calc(198px + var(--prop-gap) * 2);
  }
`;

const RemoveButtonWrap = styled.div`
  margin-left: auto;
`;

export const CreateNFT = CreateNFTComponent;
