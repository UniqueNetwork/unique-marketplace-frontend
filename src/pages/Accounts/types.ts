import { BN } from '@polkadot/util';
import { TableRowProps } from '@unique-nft/ui-kit';

export type AccountInfo = TableRowProps & {
  address: string
  name: string
  balance?: {
    KSM?: BN
  }
  deposit?: BN
  isLocal?: boolean
}
