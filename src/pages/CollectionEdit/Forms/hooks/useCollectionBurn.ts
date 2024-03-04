import { useApi } from 'hooks/useApi';
import { useMutation } from 'hooks/useMutation';
import { useMemo } from 'react';

export const useCollectionBurn = () => {
  const { api } = useApi();
  return useMutation<number, void>(useMemo(() => ({
    mutation: api?.collection?.burn.bind(api?.collection),
    getFee: api?.collection?.getBurnFee.bind(api?.collection)
  }), [api]));
};
