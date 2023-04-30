import React, { FC, useCallback } from 'react';

import { toChainFormatAddress } from 'api/chainApi/utils/addressUtils';
import { Link } from 'components/UI';
import { useApi } from 'hooks/useApi';
import { shortcutText } from 'utils/textUtils';
import config from 'config';

interface AccountLinkProps {
  accountAddress: string
  testid?: string
}

const AccountLink: FC<AccountLinkProps> = ({ accountAddress, testid }) => {
  const { chainProperties, currentChainId } = useApi();

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainProperties?.SS58Prefix || 0);
  }, [chainProperties?.SS58Prefix]);

  return (
    <Link
      target={'_blank'}
      rel={'noreferrer'}
      href={`${config.blockchains[currentChainId || '']?.scanUrl || ''}account/${formatAddress(accountAddress) || '404'}`}
      className={'unique-link primary'}
      data-testid={testid}
    >{shortcutText(formatAddress(accountAddress) || '')}</Link>
  );
};

export default AccountLink;
