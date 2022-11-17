import React, { FC, useMemo } from 'react';
import { CollectionInfoWithSchema } from '@unique-nft/substrate-client/tokens';
import styled from 'styled-components';
import { CollectionDetailSkeleton } from './CollectionDeteilSkeleton';
import { Picture } from 'components';
import { Heading } from '@unique-nft/ui-kit';
import { Icon, Link, Text } from 'components/UI';
import { CollectionStatisticsBlock } from './CollectionStaticticsBlock';
import config from '../../../config';
import { Avatar } from '../../../components/Avatar/Avatar';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import { shortcutText } from '../../../utils/textUtils';
import { isTokenOwner, toChainFormatAddress } from '../../../api/uniqueSdk/utils/addressUtils';
import { useApi } from '../../../hooks/useApi';
import { Primary500, Primary600 } from '../../../styles/colors';
import { useAccounts } from '../../../hooks/useAccounts';

interface IProps {
  collection?: CollectionInfoWithSchema
}

export const CollectionDetail: FC<IProps> = ({ collection }) => {
  const { selectedAccount } = useAccounts();

  const { chainData, currentChainId } = useApi();

  const { name, description, schema, owner } = collection || {};

  const formatedAddressOwner = useMemo(() => {
    if (!owner) return '';
    return toChainFormatAddress(owner, chainData?.SS58Prefix || 0);
  }, [owner, chainData?.SS58Prefix]);

  const isOwner = useMemo(() => {
    if (!selectedAccount) return false;
    return isTokenOwner(selectedAccount?.address, owner || '');
  }, [owner, selectedAccount]);

  if (!collection) {
    return <CollectionDetailWrapper>
      <CollectionDetailSkeleton />
    </CollectionDetailWrapper>;
  }

  const scanUrl = currentChainId ? config.blockchains[currentChainId]?.scanUrl : '';

  return <CollectionDetailWrapper>
    <CollectionCardWrapper >
      <PictureWrapper>
        <Picture alt={name || ''} src={schema?.coverPicture.fullUrl || ''} size={160} />
      </PictureWrapper>
      <CollectionInfoWrapper>
        <div>
          <Heading size='1' >{name}</Heading>
          <Text >{description}</Text>
        </div>
        <CollectionStatisticsBlock />
      </CollectionInfoWrapper>
    </CollectionCardWrapper>
    <RightSidebar>
      <LinksWrapper>
        <Icon size={24} name={'discord'} />
        <Icon size={24} name={'instagram'} />
        <Icon size={24} name={'twitter'} />
        <Icon size={24} name={'globe-simple'} />
        <Icon size={24} name={'shared'} />
      </LinksWrapper>
      <Row>
        {isOwner && <Text color='grey-500' size='m'>You own it</Text>}
        {!isOwner && <>
          <Text color='grey-500' size='m'>
            Owned&nbsp;by
          </Text>
          <AccountLink href={`${config.blockchains[currentChainId || '']?.scanUrl}account/${formatedAddressOwner || '404'}`}>
            <Avatar size={24} src={DefaultAvatar} address={formatedAddressOwner}/>
            <Text color='primary-600' size='m' >
              {shortcutText(formatedAddressOwner || '')}
            </Text>
          </AccountLink>
        </>}
      </Row>
      <LinkStyled
        target={'_blank'}
        rel={'noreferrer'}
        href={`${scanUrl}collection/${collection.id}`}
      >
        <TextStyled>View on UniqueScan</TextStyled>
        <IconWrapper>
          <Icon name={'arrow-up-right'} size={16} color={Primary500} />
        </IconWrapper>
      </LinkStyled>
    </RightSidebar>
  </CollectionDetailWrapper>;
};

const CollectionDetailWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CollectionCardWrapper = styled.div`
  display: flex;
  gap: calc(var(--gap) * 2);
`;

const PictureWrapper = styled.div`
  overflow: hidden;
  border-radius: 50%;
  width: 160px;
  height: 160px;
`;

const CollectionInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--gap) * 2);
  h1.unique-font-heading.size-1 {
    margin-bottom: 0;
  }
`;

const RightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  gap: calc(var(--gap) / 2);
`;

const LinksWrapper = styled.div`
  display: flex;
  gap: var(--gap);
  justify-content: flex-end;
  margin-bottom: calc(var(--gap) * 1.5);
`;

const Row = styled.div`
  display: flex;
  align-items: center;

  && h1 {
    margin-bottom: 0;
  }
`;

const AccountLink = styled.a`
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  color: ${Primary600};
  
  span {
    margin-left: 8px;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const LinkStyled = styled(Link)`
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 4);
  width: fit-content;
`;

const TextStyled = styled(Text)`
  && {
    color: var(--color-primary-500);
  }
`;

const IconWrapper = styled.div`
  && {
    width: 16px;
    height: 16px;
    color: var(--color-primary-500);
    padding: 0;

    path {
      stroke: currentColor;
    }
  }
`;
