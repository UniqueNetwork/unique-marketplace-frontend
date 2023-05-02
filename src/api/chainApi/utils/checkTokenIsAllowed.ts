import { TokenId } from '@unique-nft/sdk';
import { AllowedCollections } from 'api/restApi/settings/types';

export const checkAllowedTokenInSettings = (tokenId: number, collectionId: number, allowedCollections: AllowedCollections | undefined) => {
  if (!allowedCollections) return false;
  const allowedTokens = allowedCollections[collectionId]?.allowedTokens.split(',').filter((at) => !!at.trim()) || [];
  return checkTokenIsAllowed(tokenId, allowedTokens);
};

export const checkTokenIsAllowed = (tokenId: number, allowedTokens: string[]) => {
  if (allowedTokens.length === 0) return true;
  const checkInRange = ([start, end]: string[]) => Number(start) <= tokenId && Number(end) >= tokenId;
  return allowedTokens.some((item) => /^\d+-\d+$/.test(item) ? checkInRange(item.split('-')) : Number(item) === tokenId);
};

export const filterAllowedTokens = (tokens: TokenId[], allowedTokens?: string) => {
  if (!allowedTokens) return tokens;
  return tokens.filter(({ tokenId }) => checkTokenIsAllowed(tokenId, allowedTokens.split(',')));
};
