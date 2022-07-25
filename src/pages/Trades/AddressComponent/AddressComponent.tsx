import React, { useCallback, useMemo } from 'react';
import { shortcutText } from '../../../utils/textUtils';
import styled from 'styled-components';

import config from '../../../config';
import { useApi } from '../../../hooks/useApi';
import { toChainFormatAddress } from 'api/uniqueSdk/utils/addressUtils';
import { Avatar } from '../../../components/Avatar/Avatar';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';

export const AddressComponent = ({ text }: { text: string }) => {
  const { chainData } = useApi();

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainData?.SS58Prefix || 0);
  }, [chainData?.SS58Prefix]);

  const shortCut = useMemo(() => (shortcutText(formatAddress(text))), [text]);

  return <LinkWrapper>
    <Avatar size={24} src={DefaultAvatar} address={text} />
    <a
      target={'_blank'}
      rel={'noreferrer'}
      href={`${config?.scanUrl || ''}account/${formatAddress(text)}`}
      className={'unique-link primary'}
    >{shortCut}</a>
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
