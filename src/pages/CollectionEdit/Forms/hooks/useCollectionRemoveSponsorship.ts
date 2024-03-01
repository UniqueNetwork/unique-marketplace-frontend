import { useApi } from 'hooks/useApi';
import { useMutation } from 'hooks/useMutation';
import { useMemo } from 'react';

export const useCollectionRemoveSponsorship = () => {
  const { api } = useApi();
  return useMutation<number, void>(useMemo(() => ({
    mutation: api?.collection?.removeCollectionSponsor.bind(api?.collection),
    getFee: api?.collection?.getRemoveCollectionSponsorFee.bind(api?.collection)
  }), [api]));
};
