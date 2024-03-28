import { MetamaskAccountName } from 'account/MetamaskWallet';
import { BaseActionBtn } from './BaseActionBtn';
import { useAccounts } from 'hooks/useAccounts';
import { ButtonProps } from 'components/UI/Button/Button';

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
