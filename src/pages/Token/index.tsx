import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Token} from '../../api/graphQL';
import {useApi} from '../../hooks/useApi';
import {SellModal} from './Modals';
import DefaultMarketStages from "./Modals/StagesModal";
import useMarketplaceStages, {MarketType} from "../../hooks/useMarketplaceStages";
import {CancelSellFixStagesModal} from "./Modals/CancelSellModal";

// http://localhost:3000/token/124/173
const TokenPage = () => {
  const { api } = useApi();
  const { id, collectionId } = useParams<{ id: string, collectionId: string}>();
  const [token, setToken] = useState<Token>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  const onModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // TODO: debug purposes, should be taken from API instead of RPC
  useEffect(() => {
    if (!api) return;
      api?.nft?.getToken(Number(collectionId), Number(id)).then((token, ...other) => {
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

  const onCancelSellClick = useCallback(() => {
    setIsCancelModalOpen(true);
  }, [api]);

  return (<div>
    Token Page {token?.id}
    <button type='button' onClick={onBuyClick}>SELL</button>
    <button type='button' onClick={onCancelSellClick}>Cancel SELL</button>
    {isModalOpen && <SellModal
        tokenId={token?.id || -1}
        onModalClose={onModalClose}
       collectionId={collectionId || ''}/>
    }
    {isCancelModalOpen && <CancelSellFixStagesModal
        tokenId={token?.id || -1}
        onModalClose={onModalClose}
        collectionId={collectionId || ''}
        />
    }
  </div>);
};

export default TokenPage;
