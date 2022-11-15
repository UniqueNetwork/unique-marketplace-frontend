import { SelectOptionProps } from '@unique-nft/ui-kit/dist/cjs/types';
import { Offer } from '../../api/restApi/offers/types';
import { TokenByIdResult } from '@unique-nft/substrate-client/tokens';

export type TOption = SelectOptionProps & {
  direction: 'asc' | 'desc';
  field: keyof Pick<Offer & TokenByIdResult, 'price' | 'tokenId' | 'creationDate'>;
  id: string;
  title: string;
}
