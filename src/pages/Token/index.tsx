import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useApi } from '../../hooks/useApi';
import { CommonTokenDetail } from './TokenDetail/CommonTokenDetail';
import { NFTToken } from '../../api/chainApi/unique/types';
import accountContext from '../../account/AccountContext';
import { SellToken } from './SellToken/SellToken';
import { BuyToken } from './BuyToken/BuyToken';
import { isTokenOwner } from '../../api/chainApi/utils/isTokenOwner';

// http://localhost:3000/token/124/173
const TokenPage = () => {
  const { api } = useApi();
  const { id, collectionId } = useParams<{ id: string, collectionId: string}>();
  const [token, setToken] = useState<NFTToken>();

  const { selectedAccount } = useContext(accountContext);

  // TODO: debug purposes, should be taken from API instead of RPC
  useEffect(() => {
    if (!api) return;
    api?.nft?.getToken(Number(collectionId), Number(id)).then((token) => {
      setToken(token);
    }).catch((error) => {
      console.log('Get token from RPC failed', error);
    });
  }, [api]);

  const isOwner = useMemo(() => {
    if (!selectedAccount || !token?.owner) return false;
    return isTokenOwner(selectedAccount.address, token.owner);
  }, [selectedAccount, token]);

  if (!token) return null;

  return (<CommonTokenDetail token={token}><>
    {isOwner
      ? <SellToken token={token} />
      : <BuyToken token={token} />
    }
  </></CommonTokenDetail>);
};

export default TokenPage;
