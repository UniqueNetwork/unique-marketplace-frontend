import { SetCollectionLimitsBody } from '@unique-nft/sdk';
import { useApi } from 'hooks/useApi';
import { useMutation } from 'hooks/useMutation';
import { useMemo } from 'react';

export const useCollectionSetLimits = () => {
  const { api } = useApi();
  return useMutation<SetCollectionLimitsBody, void>(useMemo(() => ({
    mutation: api?.collection?.setCollectionLimits.bind(api?.collection),
    getFee: api?.collection?.getSetCollectionLimitsFee.bind(api?.collection)
  }), [api]));
};
