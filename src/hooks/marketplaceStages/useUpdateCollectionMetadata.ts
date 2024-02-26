import { useMemo } from 'react';
import { useApi } from '../useApi';
import { InternalStage, StageStatus } from '../../types/StagesTypes';
import useStages from '../useStages';
import { useAccounts } from '../useAccounts';
import { MarketableCollectionMetadata } from 'api/restApi/collections/types';
import { getSignature } from './utils/getSignature';
import { useMarketableCollection } from 'api/restApi/collections/collection';

type MetadataProps = {
  metadata: MarketableCollectionMetadata,
  bannerFile?: Blob
  coverFile?: Blob
}

export const useUpdateCollectionMetadataStages = (collectionId: number) => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const { updateCollection } = useMarketableCollection();

  const updateCollectionMetadataStages: InternalStage<MetadataProps>[] = useMemo(() => [
    {
      title: 'Updating collection',
      description: '',
      status: StageStatus.default,
      action: async ({ txParams }) => {
        if (!selectedAccount) throw new Error('Account not selected');
        const { metadata, bannerFile, coverFile } = txParams;

        const { signature, message, type } = await getSignature(selectedAccount);

        if (!signature || !type) throw new Error('Sign process canceled');

        if (bannerFile) {
          const bannerSrc = await api?.collection?.uploadFile(bannerFile);
          metadata.banner = bannerSrc?.fullUrl;
        }
        if (coverFile) {
          const coverSrc = await api?.collection?.uploadFile(coverFile);
          metadata.cover = coverSrc?.fullUrl;
        }

        await updateCollection(collectionId, metadata, type, { message, signature });
      }
    }
  ], [api?.collection, updateCollection, collectionId, selectedAccount]);

  const { stages, error, status, initiate } = useStages<MetadataProps>(updateCollectionMetadataStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
