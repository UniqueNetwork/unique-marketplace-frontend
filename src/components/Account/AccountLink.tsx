import React, { FC, useCallback } from 'react';
import { Link } from '@unique-nft/ui-kit';

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
    <>
      <Link href={`${config.scanUrl}account/${formatAddress(accountAddress) || '404'}`} title={shortcutText(formatAddress(accountAddress) || '')} />
    </>
  );
};

export default AccountLink;
