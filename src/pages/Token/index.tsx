import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Token } from '../../api/graphQL';
import { useApi } from '../../hooks/useApi';
import { SellModal } from './Modals';

// http://localhost:3000/token/124/173
const TokenPage = () => {
  const { api } = useApi();
  const { id, collectionId } = useParams<{ id: string, collectionId: string}>();
  const [token, setToken] = useState<Token>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const onModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  // TODO: debug purposes, should be taken from API instead of RPC
  useEffect(() => {
    if (!api) return;
      api?.getToken(Number(collectionId), Number(id)).then((token, ...other) => {
        console.log('token', token, 'other', other);
        setToken(token);
        console.log('token set', token);
      }).catch((error) => {
        console.log('Get token from RPC failed', error);
      });
  }, [api]);

  const onBuyClick = useCallback(() => {
    setIsModalOpen(true);
  }, [api]);

  return (<div>
    Token Page {token?.id}
    <button type='button' onClick={onBuyClick}>SELL</button>
    {isModalOpen && <SellModal
        tokenId={token?.id || -1}
        onModalClose={onModalClose}
    />
    }
  </div>);
};

export default TokenPage;
