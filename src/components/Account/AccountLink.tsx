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
    return toChainFormatAddress(address, chainData?.SS58Prefix || 0);
  }, [chainData?.SS58Prefix]);
  return (
    <a
      target={'_blank'}
      rel={'noreferrer'}
      href={`${config.scanUrl}account/${formatAddress(accountAddress) || '404'}`}
      className={'unique-link primary'}
    >{shortcutText(formatAddress(accountAddress) || '')}</a>
  );
};

export default AccountLink;
