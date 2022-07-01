import { TokenId } from '../unique/types';

export const checkTokenIsAllowed = (tokenId: number, allowedTokens: string[]) => {
  const checkInRange = ([start, end]: string[]) => Number(start) <= tokenId && Number(end) >= tokenId;
  return allowedTokens.some((item) => /^\d+-\d+$/.test(item) ? checkInRange(item.split('-')) : Number(item) === tokenId);
};

export const filterAllowedTokens = (tokens: TokenId[], allowedTokens?: string) => {
  if (!allowedTokens) return tokens;
  return tokens.filter((id) => checkTokenIsAllowed(id.toNumber(), allowedTokens.split(',')));
};
