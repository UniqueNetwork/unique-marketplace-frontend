import { BN } from '@polkadot/util';
import { MarketAccount } from 'account/AccountContext';
import { TableRowProps } from '@unique-nft/ui-kit';

export type AccountInfo = MarketAccount & TableRowProps & {
  deposit?: BN
  isLocal?: boolean
}
