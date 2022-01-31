import { AccountId } from '@polkadot/types/interfaces';
import { IKeyringPair } from '@polkadot/types/types';

export type CrossAccountId =
  | {
    Substrate: string
  }
  | {
    Ethereum: string
  }

export function normalizeAccountId(
  input: string | AccountId | CrossAccountId | IKeyringPair
): CrossAccountId {
  if (typeof input === 'string') {
    if (input.length === 48 || input.length === 47) {
      return { Substrate: input };
    } else if (input.length === 42 && input.startsWith('0x')) {
      return { Ethereum: input.toLowerCase() };
    } else if (input.length === 40 && !input.startsWith('0x')) {
      return { Ethereum: '0x' + input.toLowerCase() };
    } else {
      throw new Error(`Unknown address format: "${input}"`);
    }
  }

  if ('address' in input) {
    return { Substrate: input.address };
  }

  if ('Ethereum' in input) {
    return {
      Ethereum: input.Ethereum.toLowerCase()
    };
  } else if ('ethereum' in input) {
    return {
      Ethereum: (input as { ethereum: string }).ethereum.toLowerCase()
    };
  } else if ('Substrate' in input) {
    return input;
  } else if ('substrate' in input) {
    return {
      Substrate: (input as { substrate: string }).substrate
    };
  }

  // AccountId
  return { Substrate: input.toString() };
}
