import React, { FC, useCallback } from 'react';

import { useApi } from '../../hooks/useApi';
import { toChainFormatAddress } from '../../api/chainApi/utils/addressUtils';
import config from '../../config';
import { shortcutText } from '../../utils/textUtils';

interface AccountLinkProps {
  accountAddress: string
}

const AccountLink: FC<AccountLinkProps> = ({ accountAddress }) => {
  const { chainData } = useApi();

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainData?.properties.ss58Format || 0);
  }, [chainData?.properties.ss58Format]);
  return (
    <a
      target={'_blank'}
      rel={'noreferrer'}
      href={`${config.scanUrl}account/${formatAddress(accountAddress) || '404'}`}
      className={'unique-link secondary'}
    >{shortcutText(formatAddress(accountAddress) || '')}</a>
  );
};

export default AccountLink;
