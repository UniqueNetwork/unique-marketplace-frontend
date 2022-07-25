import React, { FC, useCallback } from 'react';

import { toChainFormatAddress } from 'api/uniqueSdk/utils/addressUtils';
import { useApi } from 'hooks/useApi';
import { shortcutText } from 'utils/textUtils';
import config from '../../config';

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
