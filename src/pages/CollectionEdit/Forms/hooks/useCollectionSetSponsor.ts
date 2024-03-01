import { SetSponsorshipBody } from '@unique-nft/sdk';
import { useApi } from 'hooks/useApi';
import { useMutation } from 'hooks/useMutation';
import { useMemo } from 'react';

export const useCollectionSetSponsor = () => {
  const { api } = useApi();
  return useMutation<SetSponsorshipBody, void>(useMemo(() => ({
    mutation: api?.collection?.setSponsorship.bind(api?.collection),
    getFee: api?.collection?.getSetSponsorshipFee.bind(api?.collection)
  }), [api]));
};
