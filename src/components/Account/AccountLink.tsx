import React, { FC, useCallback } from 'react';

import { toChainFormatAddress } from 'api/uniqueSdk/utils/addressUtils';
import { useApi } from 'hooks/useApi';
import { shortcutText } from 'utils/textUtils';
import config from '../../config';

interface AccountLinkProps {
  accountAddress: string
  testid?: string
}

const AccountLink: FC<AccountLinkProps> = ({ accountAddress, testid }) => {
  const { chainData, currentChainId } = useApi();

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, Number(chainData?.ss58Format.toHuman()) || 0);
  }, [chainData?.ss58Format]);

  return (
    <a
      target={'_blank'}
      rel={'noreferrer'}
      href={`${config.blockchains[currentChainId || '']?.scanUrl || ''}account/${formatAddress(accountAddress) || '404'}`}
      className={'unique-link primary'}
      data-testid={testid}
    >{shortcutText(formatAddress(accountAddress) || '')}</a>
  );
};

export default AccountLink;
