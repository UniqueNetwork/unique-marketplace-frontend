import { useMemo } from 'react';

import { useApi } from '../useApi';
import { InternalStage, StageStatus } from 'types/StagesTypes';
import { useAccounts } from '../useAccounts';
import useStages from '../useStages';
import { CollectionProperty, UniqueRoyaltyPartDto } from '@unique-nft/sdk';
import { SchemaTools } from '@unique-nft/schemas';

export type TSetRoyaltiesProps = {
  royalty: UniqueRoyaltyPartDto
}

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
      if (!collection?.schema) throw new Error('Collection not found');
      const encodedSchema = SchemaTools.tools.unique.collection.encodeCollectionSchemaToProperties({
        schemaName: collection.schema.schemaName,
        schemaVersion: collection.schema.schemaVersion,
        // @ts-ignore
        coverPicture: collection.schema.coverPicture,
        image: {
          urlTemplate: '{infix}'
        },
        royalties: [
          {
            value: BigInt(txParams.royalty.value * (10 ** (chainProperties?.decimals || 18))),
            address: txParams.royalty.address,
            decimals: chainProperties?.decimals,
            version: 1,
            royaltyType: txParams.royalty.royaltyType
          }
        ]
      });
      const royalties = encodedSchema.find(({ key }) => key === 'royalties');
      if (!royalties) throw new Error('Schema encoding error');
      const properties: CollectionProperty[] = [
        ...collection?.properties || [],
        royalties
      ];
      return collectionApi?.setProperties(collectionId, properties, options);
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
