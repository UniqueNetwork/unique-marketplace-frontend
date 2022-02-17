import { keyring } from '@polkadot/ui-keyring';
import { assert, hexToU8a, isHex } from '@polkadot/util';
import { ethereumEncode } from '@polkadot/util-crypto';

keyring.loadAll({})

export default function toAddress (value?: string | Uint8Array | null, allowIndices = false): string | undefined {
  if (value) {
    try {
      const u8a = isHex(value)
        ? hexToU8a(value)
        : keyring.decodeAddress(value);

      assert(allowIndices || u8a.length === 32 || u8a.length === 20, 'AccountIndex values not allowed');

      if (u8a.length === 20) {
        return ethereumEncode(u8a);
      } else {
        return keyring.encodeAddress(u8a);
      }
    } catch (error) {
      console.log(error)
      // noop, undefined return indicates invalid/transient
    }
  }

  return undefined;
}