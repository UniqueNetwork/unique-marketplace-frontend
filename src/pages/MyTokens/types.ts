import { Token } from 'api/graphQL/tokens/types';
import { Offer } from 'api/restApi/offers/types';

export type MixedTokenAndOffer = Omit<Token, 'collection' | 'nestingParentToken'> & Partial<Offer>;
