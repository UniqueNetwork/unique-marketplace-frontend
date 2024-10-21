import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FieldError, FormProvider, useForm, useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce';
import { CreateCollectionParsed } from '@unique-nft/sdk';
import { Button, ButtonGroup, Confirm, Text, useNotifications, Alert, UploadImage } from 'components/UI';

import { CollectionForm, Warning } from './types';
import { FORM_ERRORS, tabsUrls, warnings } from './constants';
import { useCollectionFormMapper } from './hooks/useCollectionFormMapper';
import { StatusCreateTransactionsModal } from './components/StatusCreateTransactionsModal/StatusCreateTransactionsModal';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import { useCollectionCreate } from './hooks/useCollectionCreate';
import { useCollectionSetTokenPropertyPermissions } from './hooks/useCollectionSetTokenPropertyPermissions';
import { useCollectionSetProperties } from './hooks/useCollectionSetProperties';
import { useBalanceInsufficient } from './hooks/useBalanceInsufficient';
import { ConfirmBtn, FeeMessage } from 'components';
import { CollectionBannerComponent } from './components/CollectionBanner';
import { CollectionCover } from './components/CollectionCover';
import { _10MB } from 'pages/CreateNFT/constants';
import { BUNDLE_PERMISSIONS, SPONSOR_PERMISSIONS, UNLIMETED_CONST, useCollectionSettings } from './tabs/CollectionSettingsProvider';
import { useMarketableCollection } from 'api/restApi/collections/collection';
import { getSignature } from 'hooks/marketplaceStages/utils/getSignature';
import { MarketableCollectionMetadata } from 'api/restApi/collections/types';
import { useCollections } from 'hooks/useCollections';
import { sleep } from 'utils/helpers';
import { useCollectionConfirmSponsorship } from 'pages/CollectionEdit/Forms/hooks/useCollectionConfirmSponsorship';
import { ethers } from 'ethers';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useEthersSigner, getNumericChainId } from 'account/WalletConnectContext/useSigner';
import { switchNetwork } from 'utils/swithChain';
import { parseEthersV6TxReceipt } from '@unique-nft/solidity-interfaces';
import { Address } from '@unique-nft/utils';

//@ts-ignore
const COLECTION_CREATION_FEE = 2n * 10n ** 18n;
const CREATE_CONTRACT_ADDRESS = '0x5b1445236C7269aB4dac15e57aA5a0656043aE8a';

export const WrapperContent = styled.div`
  box-sizing: border-box;

  @media screen and (min-width: 1025px) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-radius: var(--prop-border-radius);
    padding: calc(var(--prop-gap) * 2);
    background-color: var(--color-additional-light);
    flex: 1 1 66.6666%;
  }
`;

const WrapperContentStyled = styled(WrapperContent)`
  position: relative;
  margin-bottom: calc(var(--prop-gap) * 2.5);
  border-radius: 8px;
  padding: 0px;

  @media screen and (min-width: 1025px) {
    margin-bottom: 0;
    padding-bottom: 20px;
  }
`;

const CreateCollectionComponent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [warning, setWarning] = useState<Warning | null>();
  const [currentSubmitStage, setCurrentSubmitStage] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentChainId, chainProperties } = useApi();
  const { error, info } = useNotifications();
  const {
    selectedAccount,
    isLoading,
    accounts: { size: accountsLength }
  } = useAccounts();
  const formMapper = useCollectionFormMapper();
  // const { walletProvider } = useAppKitProvider('eip155');

  const signer = useEthersSigner();
  const {
    getFee,
    fee,
    feeFormatted,
    feeLoading: feeCollectionLoading,
    submitWaitResult,
    feeError,
    submitWaitResultError
  } = useCollectionCreate();
  const { api } = useApi();

  const setTokenPropertyPermissions = useCollectionSetTokenPropertyPermissions();
  const setProperties = useCollectionSetProperties();

  const [banner, setBanner] = useState<{ src: string, file?: Blob }>();
  const [cover, setCover] = useState<{ src: string, file?: Blob }>();

  const onUploadBanner = useCallback((src: string, file: Blob) => {
    setBanner({ src, file });
  }, []);

  const onRemoveBanner = useCallback(() => {
    setBanner(undefined);
  }, []);

  const onUploadCover = useCallback((src: string, file: Blob) => {
    setCover({ src, file });
  }, []);

  const onRemoveCover = useCallback(() => {
    setCover(undefined);
  }, []);

  const {
    collectionSize,
    accountTokenOwnershipLimit,
    tokenTransferPermission,
    bundlePermission,
    collectionSponsoring,
  } = useCollectionSettings();

  const collectionForm = useForm<CollectionForm>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      symbol: '',
      description: '',
      //social media
      discord: '',
      website: '',
      twitter: '',
      instagram: '',
      telegram: '',
      reddit: '',
      address: selectedAccount?.address,
    }
  });
  const {
    control,
    formState: { isValid, errors },
    handleSubmit
  } = collectionForm;
  const collectionFormValues = useWatch<CollectionForm>({
    control
  });

  const needConfirmSponsoring = useMemo(() => (
    collectionSponsoring == SPONSOR_PERMISSIONS.OWNER
  ), [collectionSponsoring]);

  const {
    getFee: getConfirmSponsorshipFee,
    feeFormatted: feeConfirmSponsorship,
    submitWaitResult: submitConfirmSponsorshipResult
  } = useCollectionConfirmSponsorship();

  const [sumFee, setSumFee] = useState(feeFormatted);
  const [feeLoading, setFeeLoading] = useState(false);

  const [collectionDebounceValue] = useDebounce(collectionFormValues as any, 500);

  const returnToCreateToken = useMemo(() => {
    return (
      (location.state as { returnToCreateToken: boolean })?.returnToCreateToken || false
    );
  }, [location.state]);

  useEffect(() => {
    if (window.location.pathname.includes(tabsUrls[currentStep - 1])) return;
    navigate(tabsUrls[currentStep - 1], { state: { returnToCreateToken } });
  }, [currentStep]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    selectedAccount && collectionForm.setValue('address', selectedAccount?.address);
  }, [selectedAccount, isLoading, accountsLength]);

  useEffect(() => {
    if (!feeError) {
      return;
    }
    error(feeError);
  }, [feeError]);

  useEffect(() => {
    if (
      !submitWaitResultError &&
      !setTokenPropertyPermissions.submitWaitResultError &&
      !setProperties.submitWaitResultError
    ) {
      return;
    }
    setIsCreating(false);
    error(
      submitWaitResultError ||
      setTokenPropertyPermissions.submitWaitResultError ||
      setProperties.submitWaitResultError
    );
  }, [
    submitWaitResultError,
    setTokenPropertyPermissions.submitWaitResultError,
    setProperties.submitWaitResultError
  ]);

  const goToNextStep = (step: number) => setCurrentStep(step);
  const goToPreviousStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };
  const onNextStep = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    goToNextStep(currentStep + 1);
  }, [cover, warnings, setWarning, goToNextStep, currentStep]);

  const { updateCollection } = useMarketableCollection();
  const { appendCollection } = useCollections();

  const onSubmit = async (form: CollectionForm) => {
    if (!selectedAccount) {
      return;
    }

    if (!cover) {
      setWarning(warnings.coverIsNotDefine);
      return;
    }

    setCurrentSubmitStage(0);
    setIsCreating(true);
    const payload = formMapper(form);
    payload.cover_image = { url: '' };
    payload.permissions = {};
    payload.limits = {};
    let bannerSrc;

    if (banner && banner.file) {
      try {
        bannerSrc = await api?.collection?.uploadFile(banner.file);
      } catch (err) {
        setIsCreating(false);
        error(
          `Upload banner failed`
        );
      }
    }

    if (cover && cover.file) {
      try {
        const coverSrc = await api?.collection?.uploadFile(cover.file);
        payload.cover_image.url = coverSrc?.fullUrl || '';
      } catch (err) {
        setIsCreating(false);
        error(
          `Upload cover failed`
        );
      }
    }
    let collectionId;
    let createdCollection: CreateCollectionParsed | undefined;
    try {
      if (bundlePermission) {
        if (bundlePermission === BUNDLE_PERMISSIONS.UNLIMETED) {
          payload.permissions.nesting = {
            tokenOwner: true,
            collectionAdmin: true
          };
        } else if (bundlePermission === BUNDLE_PERMISSIONS.COLLECTION_OWNER_OR_ADMIN) {
          payload.permissions.nesting = {
            tokenOwner: false,
            collectionAdmin: true,
          };
        } else if (bundlePermission === BUNDLE_PERMISSIONS.RESTRICTED) {
          payload.permissions.nesting = {
            tokenOwner: false,
            collectionAdmin: false,
          };
        }
      }

      if (collectionSponsoring == SPONSOR_PERMISSIONS.OWNER || selectedAccount?.address || createdCollection?.collectionId) {
        payload.sponsorship = {
          address: selectedAccount?.address || '',
          isConfirmed: true,
        };
      }

      if (collectionSize !== UNLIMETED_CONST) {
        payload.limits.tokenLimit = +collectionSize;
      }

      if (accountTokenOwnershipLimit !== UNLIMETED_CONST) {
        payload.limits.accountTokenOwnershipLimit = +accountTokenOwnershipLimit;
      }

      if (tokenTransferPermission) {
        payload.limits.transfersEnabled = tokenTransferPermission;
      }
      setCurrentSubmitStage(1);
      console.log('create collection', selectedAccount.address, isEthereumAddress(selectedAccount.address))
      if (!isEthereumAddress(selectedAccount.address)) {
        createdCollection = await submitWaitResult({ payload });

        collectionId = createdCollection?.collectionId || 0;
      } else {
        if (!signer) throw new Error('No Reown wallet provider found');
        const numericChainId = getNumericChainId(currentChainId);
        switchNetwork(numericChainId);
        const CollectionManager = new ethers.Contract(CREATE_CONTRACT_ADDRESS, (await import('./CreateCollection.json')).default, signer);
        const txCreateCollection = await (await CollectionManager.createCollection(
          payload.name,
          payload.description,
          payload.symbol,
          payload.cover_image.url,
          !!payload.limits.transfersEnabled,
          payload.limits.tokenLimit || 0,
          payload.limits.accountTokenOwnershipLimit || (payload.limits.tokenLimit ? payload.limits.tokenLimit : 100000000),
          payload.permissions.nesting?.tokenOwner,
          payload.permissions.nesting?.collectionAdmin,
          { gasLimit: 500_000, value: COLECTION_CREATION_FEE }
        )).wait();
        

        collectionId = Number(parseEthersV6TxReceipt(txCreateCollection).events?.CollectionCreated?.collectionId as string)

        console.log(collectionId, 'COLLECTION_ID');
      }
    } catch (err) {
      console.error(err);
      setIsCreating(false);
      error('You need to sign the transaction');
      return;
    }

    if (needConfirmSponsoring) {
      setCurrentSubmitStage(2);
      try {
        await submitConfirmSponsorshipResult(({ payload: collectionId }));
      } catch (err) {
        setIsCreating(false);
        error(
          `Confirm sponsorship failed`
        );
      }
    }

    setCurrentSubmitStage(needConfirmSponsoring ? 3 : 2);

    // Set banner & links
    if (bannerSrc || form.telegram || form.twitter || form.website || form.discord || form.instagram || form.reddit) {
      await appendCollection(collectionId);
      await sleep(1000);
      const { signature, message, type } = await getSignature(selectedAccount);
      if (!type && !signature) return;
      const updateData: MarketableCollectionMetadata = {};

      if (bannerSrc) updateData.banner = bannerSrc.fullUrl;
      if (form.website) updateData.website = form.website;
      if (form.discord) updateData.discord = form.discord;
      if (form.twitter) updateData.twitter = form.twitter;
      if (form.instagram) updateData.instagram = form.instagram;
      if (form.telegram) updateData.telegram = form.telegram;
      if (form.reddit) updateData.reddit = form.reddit;

      if (!type || !signature) return;

      updateCollection(collectionId, updateData, type, { message, signature });
    }

    setIsCreating(false);
    info('Collection created successfully');

    if (returnToCreateToken) {
      navigate(`/${currentChainId}/create-token`, {
        state: {
          id: collectionId,
          name: payload.name,
          description: payload.description,
          // @ts-ignore
          cover: payload.schema?.coverPicture.ipfsCid
        }
      });
      return;
    }
    navigate(`/${currentChainId}/collections`);
  };

  useEffect(() => {
    const calculateFees = async () => {
      if (collectionDebounceValue && isValid) {
        const collection = formMapper(collectionDebounceValue);

        await getFee({ payload: collection });

        // if (needConfirmSponsoring && selectedAccount) {
        //   await getConfirmSponsorshipFee({ payload: 1 });
        // }

        if (!(collectionFormValues.name && collectionFormValues.symbol)) return;

        setFeeLoading(true);

        // const provider = new ethers.providers.Web3Provider(walletProvider);
        // const signer = await provider.getSigner();

        let feeToUse = feeFormatted;
        if (
          isEthereumAddress(selectedAccount?.address)
        ) {
          if (!signer) throw new Error('No Reown wallet provider found');
          const feeData = await signer.provider!.getFeeData();
          const gasPrice = feeData.gasPrice;
          console.log(gasPrice, 'GAS_PRICE')

          const CollectionManager = new ethers.Contract(
            CREATE_CONTRACT_ADDRESS,
            (await import('./CreateCollection.json')).default,
            signer
          );

          const gasEstimate = await CollectionManager.createCollection.estimateGas(
            collectionFormValues.name || '',
            collectionFormValues.description || '',
            collectionFormValues.symbol || 'XXX',
            cover?.src || '',
            !!collectionFormValues.transfersEnabled || true,
            collectionFormValues.tokenLimit || 0,
            collectionFormValues.accountTokenOwnershipLimit || 0,
            collectionFormValues.nesting?.tokenOwner || '',
            collectionFormValues.nesting?.collectionAdmin || '',
            { gasLimit: 500_000, value: COLECTION_CREATION_FEE }
          );
          const totalFee = gasEstimate * gasPrice + COLECTION_CREATION_FEE;
          feeToUse = ethers.formatUnits(totalFee, 18)
        } else {
          feeToUse = feeFormatted;
        }
        const finalFee = String(Number(feeToUse));

        setSumFee(finalFee);
        setFeeLoading(false);
      }
    };

    calculateFees();
  }, [
    collectionDebounceValue,
    isValid,
    needConfirmSponsoring,
    selectedAccount?.name,
    getFee,
    getConfirmSponsorshipFee,
    collectionFormValues,
    cover?.src,
    feeFormatted,
    feeConfirmSponsorship,
  ]);


  const isFirstStep = currentStep - 1 === 0;
  const isLastStep = currentStep === tabsUrls.length;

  const isolatedCollectionForm = useMemo(() => (
    <FormProvider {...collectionForm}>
      <Outlet />
    </FormProvider>
  ), [collectionForm]);

  const { isBalanceInsufficient } = useBalanceInsufficient(sumFee || '0');

  const errorTooltip = useMemo(() => {
    if (!isValid) {
      if (!errors || !Object.values(errors).length) {
        return FORM_ERRORS.REQUIRED_FIELDS;
      }
      const { ...fieldErrors } = errors;

      return Object.values(fieldErrors)
        .reduce<FieldError[]>((arr, item) => {
          if (item && !arr.find(({ type }) => type === item.type)) {
            arr.push(item as FieldError);
          }
          return arr;
        }, [])
        .map(({ message }) => message)
        .join('\n');
    }
    if (isBalanceInsufficient) {
      return (
        `${FORM_ERRORS.INSUFFICIENT_BALANCE}${chainProperties?.token}`
      );
    }
    return null;
  }, [
    isBalanceInsufficient,
    isValid,
    errors,
    errors.attributes,
    collectionDebounceValue
  ]);

  const isValidFirstStep = useMemo(() => {
    return !errors.name || !errors.symbol;
  }, [errors, isBalanceInsufficient]);

  const isValidSecondStep = useMemo(() => {
    return !errors.name || !errors.symbol || !errors.coverPictureIpfsCid;
  }, [errors, isBalanceInsufficient]);


  const creatingStages = useMemo(() => {
    const baseStages = ['Upload images', 'Creating collection'];

    const confirmSponsorshipStages = ['Confirm Sponsorship'];

    const shouldAddBannerStage = banner?.src || collectionFormValues.telegram ||
      collectionFormValues.twitter || collectionFormValues.website ||
      collectionFormValues.discord || collectionFormValues.instagram || collectionFormValues.reddit;

    return needConfirmSponsoring
      ? [...baseStages, ...confirmSponsorshipStages, ...(shouldAddBannerStage ? ['Setting banner & links'] : [])]
      : [...baseStages, ...(shouldAddBannerStage ? ['Setting banner & links'] : [])];
  }, [
    needConfirmSponsoring,
    banner?.src,
    collectionFormValues.telegram,
    collectionFormValues.twitter,
    collectionFormValues.website,
    collectionFormValues.discord,
    collectionFormValues.instagram,
    collectionFormValues.reddit
  ]);

  return (
    <Wrapper>
      <WrapperContentStyled>
        <CollectionBannerComponent
          src={banner?.src}
          onChange={onUploadBanner}
          onRemove={onRemoveBanner}
        />
        <CoverWrapper>
          <CollectionCover
            name={''}
            src={cover?.src}
            onChange={onUploadCover}
            onRemove={onRemoveCover}
          />
        </CoverWrapper>
        <FormWrapper>
          {isolatedCollectionForm}
          {isBalanceInsufficient || (!isBalanceInsufficient && isValid) ? (
            <FeeMessage
              fee={sumFee}
              isFeeLoading={feeLoading}
              testid='fee'
            />
          ) : (
            <Alert type='warning'>
              A fee will be calculated after corrected filling required fields
            </Alert>
          )}
          <ButtonGroup $fill>
            {!isFirstStep && (
              <Button
                iconLeft={{
                  color: 'var(--color-primary-400)',
                  name: 'arrow-left',
                  size: 12
                }}
                title='Back'
                onClick={() => goToPreviousStep(currentStep - 1)}
              />
            )}
            {!isLastStep && (
              <ConfirmBtn
                iconRight={{
                  color: 'currentColor',
                  name: 'arrow-right',
                  size: 12
                }}
                title='Next step'
                disabled={!isValidFirstStep || !isValidSecondStep}
                tooltip={errorTooltip}
                onClick={handleSubmit(onNextStep)}
              />
            )}

            {isLastStep && <ConfirmBtn
              role='primary'
              title='Create collection'
              tooltip={errorTooltip}
              disabled={!isValid || feeLoading || isBalanceInsufficient}
              onClick={handleSubmit(onSubmit)}
            />}

          </ButtonGroup>
          <Confirm
            buttons={[
              { title: 'Return', role: 'primary', onClick: () => setWarning(null) },
            ]}
            isVisible={!!warning}
            title={warning?.title}
            onClose={() => setWarning(null)}
          >
            <Text>{warning?.description}</Text>
          </Confirm>
          <StatusCreateTransactionsModal
            isVisible={isCreating}
            descriptions={creatingStages}
            step={currentSubmitStage}
          />
        </FormWrapper>
      </WrapperContentStyled>
    </Wrapper>
  );
};

const Wrapper = styled.div``;

const FormWrapper = styled.div`
  margin: calc(var(--prop-gap) * 2.5) 0;
  padding-left: calc(32px + 160px + 10px + 24px);
  max-width: 766px;
`;

const CoverWrapper = styled.div`
  margin-left: 28px;
`;

export const CreateCollection = CreateCollectionComponent;
