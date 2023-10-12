import { SelectOptionProps } from '@unique-nft/ui-kit/dist/cjs/types';
import { Offer } from '../../api/restApi/offers/types';
import { CollectionInfoWithSchemaResponse, TokenByIdResponse } from '@unique-nft/sdk';

export type TOption = SelectOptionProps & {
  direction: 'asc' | 'desc';
  field: keyof Pick<Offer & TokenByIdResponse, 'price' | 'tokenId' | 'creationDate'>;
  id: string;
  title: string;
}

export type CollectionPageProps = { collection: CollectionInfoWithSchemaResponse };
