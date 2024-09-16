import { Text, Heading, InputText } from 'components/UI';
import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from 'components/UI/Checkbox/Checkbox2';
import { BUNDLE_PERMISSIONS, SPONSOR_PERMISSIONS, UNLIMETED_CONST, useCollectionSettings } from './CollectionSettingsProvider';
import CollectionHeader from '../components/CollectionHeader';

export const CollectionSettings = () => {
  const { watch } = useFormContext();
  const name = watch('name');
  const description = watch('description');
  const {
    collectionSize,
    setCollectionSize,
    accountTokenOwnershipLimit,
    setaccountTokenOwnershipLimit,
    tokenTransferPermission,
    setTokenTransferPermission,
    bundlePermission,
    setBundlePermission,
    collectionSponsoring,
    setCollectionSponsoring,
  } = useCollectionSettings();

  return (
    <>
      <CollectionInfoBlock>
        <CollectionHeader name={name} description={description} />
      </CollectionInfoBlock>
      <Heading size='2'>Collection settings</Heading>

      <TitleWrap>
        <Text size='l' color='--color-secondary-500'>
          Collection size
        </Text>
      </TitleWrap>
      <Text size='m' color='grey-500' weight='light'>
        Maximum number of NFTs in the collection. Can be limited later, but can never be reset back to ‘unlimited‘.
      </Text>
      <OptionsWrapper>
        <Checkbox
          checked={collectionSize === UNLIMETED_CONST}
          label={'Unlimited (default)'}
          size={'m'}
          onChange={() => setCollectionSize(UNLIMETED_CONST)}
          testid={''}
          isRadio={true}
        />
        <CheckboxTextInput>
          <Checkbox
            checked={collectionSize !== UNLIMETED_CONST}
            label={''}
            size={'m'}
            onChange={() => setCollectionSize('100')}
            testid={''}
            isRadio={true}
          />
          <InputText
            label=''
            role='number'
            value={collectionSize === UNLIMETED_CONST ? '' : collectionSize}
            onChange={(value) => setCollectionSize(value)}
          />
        </CheckboxTextInput>
      </OptionsWrapper>


      <TitleWrap>
        <Text size='l' color='--color-secondary-500'>
          NFTs per account limit
        </Text>
      </TitleWrap>
      <Text size='m' color='grey-500' weight='light'>
        Maximum number of NFTs one address can own. Can be limited later, but can never be reset back to ‘unlimited‘.
      </Text>
      <OptionsWrapper>
        <Checkbox
          checked={accountTokenOwnershipLimit === UNLIMETED_CONST}
          label={'Unlimited (default)'}
          size={'m'}
          onChange={() => setaccountTokenOwnershipLimit(UNLIMETED_CONST)}
          testid={''}
          isRadio={true}
        />
        <CheckboxTextInput>
          <Checkbox
            checked={accountTokenOwnershipLimit !== UNLIMETED_CONST}
            label={''}
            size={'m'}
            onChange={() => setaccountTokenOwnershipLimit('100')}
            testid={''}
            isRadio={true}
          />
          <InputText
            label=''
            role='number'
            value={accountTokenOwnershipLimit === UNLIMETED_CONST ? '' : accountTokenOwnershipLimit}
            onChange={(value) => setaccountTokenOwnershipLimit(value)}
          />
        </CheckboxTextInput>
      </OptionsWrapper>
      <TitleWrap>
        <Text size='l' color='--color-secondary-500'>
          NFT transfers permission
        </Text>
      </TitleWrap>
      <Text size='m' color='grey-500' weight='light'>
        The setting determines whether NFTs of this collection can be transferred. Can be limited later, but can never be reset back to ‘unlimited‘.
      </Text>
      <OptionsWrapper>
        <Checkbox
          checked={tokenTransferPermission}
          label={'Unlimited (default)'}
          size={'m'}
          onChange={() => setTokenTransferPermission(true)}
          testid={''}
          isRadio={true}
        />
        <Checkbox
          checked={!tokenTransferPermission}
          label={'All transfers are restricted forever'}
          size={'m'}
          onChange={() => setTokenTransferPermission(false)}
          testid={''}
          isRadio={true}
        />
      </OptionsWrapper>
      <TitleWrap>
        <Text size='l' color='--color-secondary-500'>
          Bundle permission
        </Text>
      </TitleWrap>
      <Text size='m' color='grey-500' weight='light'>
        The setting determines whether NFT bundles can be created within this collection. Can be limited later, but can never be reset back to ‘unlimited‘.
        <a target='_blank' href=''><Blue>Learn More</Blue></a>
      </Text>
      <OptionsWrapper>
        <Checkbox
          checked={bundlePermission === BUNDLE_PERMISSIONS.UNLIMETED}
          onChange={() => setBundlePermission(BUNDLE_PERMISSIONS.UNLIMETED)}
          label={'Unlimited (default)'}
          size={'m'}
          testid={''}
          isRadio={true}
        />
        <Checkbox
          checked={bundlePermission === BUNDLE_PERMISSIONS.COLLECTION_OWNER_OR_ADMIN}
          onChange={() => setBundlePermission(BUNDLE_PERMISSIONS.COLLECTION_OWNER_OR_ADMIN)}
          label={'Only collection owner or admin (not an NFT owner) can create bundles'}
          size={'m'}
          testid={''}
          isRadio={true}
        />
        <Checkbox
          checked={bundlePermission === BUNDLE_PERMISSIONS.RESTRICTED}
          onChange={() => setBundlePermission(BUNDLE_PERMISSIONS.RESTRICTED)}
          label={'Bundle creation is restricted forever'}
          size={'m'}
          testid={''}
          isRadio={true}
        />
      </OptionsWrapper>


      <TitleWrap>
        <Text size='l' color='--color-secondary-500'>
          Collection sponsorin
        </Text>
      </TitleWrap>
      <Text size='m' color='grey-500' weight='light'>
        If collection sponsoring is enabled, the sponsor pays for all transfers of this collection NFTs made by any NFT owner. Can be set or changed later.
        <a target='_blank' href=''><Blue>Learn More</Blue></a>
      </Text>
      <OptionsWrapper>
        <Checkbox
          checked={collectionSponsoring === SPONSOR_PERMISSIONS.NOT_SPONSORED}
          onChange={() => setCollectionSponsoring(SPONSOR_PERMISSIONS.NOT_SPONSORED)}
          label={'Collection is not sponsored (default)'}
          size={'m'}
          testid={''}
          isRadio={true}
        />
        <Checkbox
          checked={collectionSponsoring === SPONSOR_PERMISSIONS.OWNER}
          onChange={() => setCollectionSponsoring(SPONSOR_PERMISSIONS.OWNER)}
          label={'Collection owner is a sponsor'}
          size={'m'}
          testid={''}
          isRadio={true}
        />
      </OptionsWrapper>
    </>
  );
};

const CollectionInfoBlock = styled.div``;

const OptionsWrapper = styled.div`
  margin-top: calc(var(--prop-gap));
  margin-bottom: calc(var(--prop-gap) * 2);
  display: flex;
  flex-direction: column;
  gap: 16px;

  label {
    color: var(--color-grey-600);
    font-size: 14px;
  }
`;

const TitleWrap = styled.div`
  margin-bottom: 4px;
`;

const CheckboxTextInput = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;

  .unique-checkbox-wrapper {
    margin-bottom: 18px;
  }

  .unique-input-text {
    width: 100%;
  }
`;

const Blue = styled.span`
  margin-left: 8px;
  color: var(--color-primary-500);
`;