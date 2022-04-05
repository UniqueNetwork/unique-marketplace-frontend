import React, { useCallback, useMemo } from 'react';
import { shortcutText } from '../../../utils/textUtils';
import { Link } from '@unique-nft/ui-kit';
import config from '../../../config';
import styled from 'styled-components/macro';
import { useApi } from '../../../hooks/useApi';
import { toChainFormatAddress } from '../../../api/chainApi/utils/addressUtils';

export const AddressComponent = ({ text }: { text: string }) => {
  const { chainData } = useApi();

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainData?.properties.ss58Format || 0);
  }, [chainData?.properties.ss58Format]);

  const shortCut = useMemo(() => (shortcutText(formatAddress(text))), [text]);

  return <LinkWrapper><Link
    href={`${config?.scanUrl || ''}account/${formatAddress(text)}`}
    title={shortCut}
  /></LinkWrapper>;
};

const LinkWrapper = styled.span`
  .unique-link {
    font-size: 16px;
  }
`;
