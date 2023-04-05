import React, { useCallback, useMemo } from 'react';
import { shortcutText } from '../../../utils/textUtils';
import styled from 'styled-components';

import config from '../../../config';
import { useApi } from '../../../hooks/useApi';
import { toChainFormatAddress } from 'api/chainApi/utils/addressUtils';
import { Avatar } from '../../../components/Avatar/Avatar';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';
import { Link } from 'components/UI';
import { useAccounts } from '../../../hooks/useAccounts';

export const AddressComponent = ({ text, testid }: { text: string, testid: string }) => {
  const { chainData, currentChainId } = useApi();
  const { selectedAccount } = useAccounts();

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainData?.SS58Prefix || 0);
  }, [chainData?.SS58Prefix]);

  const shortCut = useMemo(() => {
    if (selectedAccount?.getAddress() === text) return 'Me';
    return shortcutText(formatAddress(text));
  }, [text, selectedAccount, formatAddress]);

  return <LinkWrapper>
    <Avatar size={24} src={DefaultAvatar} address={text} />
    <Link
      target={'_blank'}
      rel={'noreferrer'}
      href={`${config.blockchains[currentChainId || '']?.scanUrl || ''}account/${formatAddress(text)}`}
      className={'unique-link primary'}
      data-testid={`${testid}-address`}
    >{shortCut}</Link>
  </LinkWrapper>;
};

const LinkWrapper = styled.span`
  && {
    display: flex;
    align-items: center;
    column-gap: calc(var(--gap) / 2);
    
    & > div {
      padding: 0;
    }
  
    .unique-link {
      font-size: 16px;
    }

    @media (max-width: 768px) {
      column-gap: calc(var(--gap) / 4);
    }
  }
`;
