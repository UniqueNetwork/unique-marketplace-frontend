import { useMemo } from 'react';

import { useApi } from '../useApi';
import { InternalStage, StageStatus } from 'types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';
import { CollectionProperty, UniqueRoyaltyPartDto } from '@unique-nft/sdk';
import { SchemaTools } from '@unique-nft/schemas';
import { Royalty } from 'pages/CollectionEdit/types';

export type TSetRoyaltiesProps = {
  royalties: Royalty[]
}

const defaultDecimals = 4;

export const useSetRoyaltiesStages = (collectionId: number) => {
  const { api, chainProperties } = useApi();
  const { selectedAccount } = useAccounts();
  const collectionApi = api?.collection;

  const setRoyaltiesStages: InternalStage<TSetRoyaltiesProps>[] = useMemo(() => [
  {
    title: 'Updating collection royalties',
    description: '',
    status: StageStatus.default,
    action: async ({ txParams, options }) => {
      const collection = await collectionApi?.getCollection(collectionId);
      if (!collection?.info) throw new Error('Collection not found');
      const encodedSchema = SchemaTools.tools.unique.collection.encodeCollectionSchemaToProperties({
        schemaName: collection.info.schemaName || '',
        schemaVersion: collection.info.originalSchemaVersion || '1.0.0',
        coverPicture: collection.info.cover_image || {url: ''},
        image: {
          urlTemplate: '{infix}'
        },
        royalties: txParams.royalties.length > 0
        ? txParams.royalties.map((royalty) => ({
            value: BigInt(Number(royalty.value) * (10 ** (defaultDecimals - 2))),
            address: royalty.address,
            decimals: defaultDecimals,
            version: 1,
            royaltyType: 'DEFAULT'
          })
        )
        : []
      });
      const royalties = encodedSchema.find(({ key }) => key === 'royalties');
      if (!royalties) throw new Error('Schema encoding error');
      const properties: CollectionProperty[] = [royalties];
      return await collectionApi?.setProperties(collectionId, properties, options);
    }
  }], [chainProperties?.decimals, collectionApi, collectionId]);

  const { stages, error, status, initiate } = useStages<TSetRoyaltiesProps>(setRoyaltiesStages, selectedAccount);

  return {
    stages,
    error,
    status,
    initiate
  };
};
