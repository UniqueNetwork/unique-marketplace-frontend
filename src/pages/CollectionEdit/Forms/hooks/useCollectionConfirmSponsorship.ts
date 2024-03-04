import { useApi } from 'hooks/useApi';
import { useMutation } from 'hooks/useMutation';
import { useMemo } from 'react';

export const useCollectionConfirmSponsorship = () => {
  const { api } = useApi();
  return useMutation<number, void>(useMemo(() => ({
    mutation: api?.collection?.confirmSponsorship.bind(api?.collection),
    getFee: api?.collection?.getConfirmCollectionSponsorFee.bind(api?.collection)
  }), [api]));
};
