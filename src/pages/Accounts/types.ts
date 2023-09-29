import { BN } from '@polkadot/util';
import { Account } from 'account/types';
import { TableRowProps } from '@unique-nft/ui-kit';

export type AccountInfo = Account & TableRowProps & {
  deposit?: BN
  isLocal?: boolean
}
