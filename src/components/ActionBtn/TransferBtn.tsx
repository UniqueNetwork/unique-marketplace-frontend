import { ButtonProps } from 'components/UI/Button/Button';
import { BaseActionBtn } from './BaseActionBtn';

export const TransferBtn = (props: ButtonProps & { tooltip?: string | null }) => {
  return (
    <BaseActionBtn
      {...props}
      actionEnabled={true}
      actionText='Transfer temporary unavailable due to a chain upgrade'
    />
  );
};
