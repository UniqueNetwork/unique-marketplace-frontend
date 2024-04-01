import { SelectOptionProps } from 'components/UI/types';
import { Offer } from '../../api/restApi/offers/types';
import { CollectionWithInfoV2Dto, TokenByIdResponse } from '@unique-nft/sdk';

export type TOption = SelectOptionProps & {
  direction: 'asc' | 'desc';
  field: keyof Pick<Offer & TokenByIdResponse, 'price' | 'tokenId' | 'creationDate'>;
  id: string;
  title: string;
}

export type CollectionPageProps = { collection: CollectionWithInfoV2Dto };
