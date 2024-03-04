import { MetamaskAccountName } from 'account/MetamaskWallet';
import { BaseActionBtn } from './BaseActionBtn';
import { ButtonProps } from '@unique-nft/ui-kit';
import { useAccounts } from 'hooks/useAccounts';

export const ConfirmBtn = (props: ButtonProps & { tooltip?: string | null }) => {
  const { selectedAccount } = useAccounts();
  return (
    <BaseActionBtn
      {...props}
      actionEnabled={
        true
      }
      actionText={
        selectedAccount?.name === MetamaskAccountName
          ? null
          : 'Minting temporary unavailable due to a chain upgrade'
      }
    />
  );
};
