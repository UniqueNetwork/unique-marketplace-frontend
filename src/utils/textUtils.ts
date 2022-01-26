import { AccountId } from '@polkadot/types/interfaces';

export const shortcutText = (text: string) => {
  // Cut it to the first and last 5 symbols
  const [_, start, end] = /^(.{5}).*(.{5})$/.exec(text) || [];

  return start && end ? `${start}...${end}` : text;
};
