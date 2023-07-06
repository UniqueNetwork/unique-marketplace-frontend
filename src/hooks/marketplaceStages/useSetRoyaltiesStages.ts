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
      if (!collection?.schema) throw new Error('Collection not found');
      const encodedSchema = SchemaTools.tools.unique.collection.encodeCollectionSchemaToProperties({
        schemaName: collection.schema.schemaName,
        schemaVersion: collection.schema.schemaVersion,
        // @ts-ignore
        coverPicture: collection.schema.coverPicture,
        image: {
          urlTemplate: '{infix}'
        },
        royalties: txParams.royalty.value > 0
        ? [
          {
            value: BigInt(txParams.royalty.value * (10 ** (defaultDecimals - 2))),
            address: txParams.royalty.address,
            decimals: defaultDecimals,
            version: 1,
            royaltyType: 'DEFAULT'
          }
        ]
        : []
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
