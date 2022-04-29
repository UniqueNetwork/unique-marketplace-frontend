import React, { useCallback, useMemo } from 'react';
import { shortcutText } from '../../../utils/textUtils';
import styled from 'styled-components/macro';

import config from '../../../config';
import { useApi } from '../../../hooks/useApi';
import { toChainFormatAddress } from '../../../api/chainApi/utils/addressUtils';
import { Avatar } from '../../../components/Avatar/Avatar';
import DefaultAvatar from '../../../static/icons/default-avatar.svg';

export const AddressComponent = ({ text }: { text: string }) => {
  const { chainData } = useApi();

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainData?.properties.ss58Format || 0);
  }, [chainData?.properties.ss58Format]);

  const shortCut = useMemo(() => (shortcutText(formatAddress(text))), [text]);

  return <LinkWrapper>
    <Avatar size={24} src={DefaultAvatar} />
    <a
      target={'_blank'}
      rel={'noreferrer'}
      href={`${config?.scanUrl || ''}account/${formatAddress(text)}`}
      className={'unique-link secondary'}
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
  }
`;
