import { BN } from '@polkadot/util';
import { Account } from 'account/types';
import { TableRowProps } from 'components/UI/Table/Table';

export type AccountInfo = Account & TableRowProps & {
  deposit?: BN
  isLocal?: boolean
}
