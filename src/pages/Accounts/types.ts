import { BN } from '@polkadot/util';
import { AccountSigner } from 'account/AccountContext';

export type AccountInfo = {
  address: string
  name: string
  balance?: {
    KSM?: BN
  }
  deposit?: BN
  signerType: AccountSigner
}
