import { Heading, Text, Loader } from 'components/UI';
import { Modal, ModalProps } from 'components/UI/Modal';
import { useAccounts } from 'hooks/useAccounts';
import { useBalanceInsufficient } from 'pages/CreateCollection/hooks/useBalanceInsufficient';
import { FeeMessage, TransferBtn } from 'components';
import { NOT_ENOUGH_BALANCE_MESSAGE } from '../constants';
import { ContentRow } from './ContentRow';

export type ConfirmUpdateCollectionModalProps = Omit<
  ModalProps,
  'children' | 'footerButtons' | 'title'
> & {
  onConfirm(): void;
  fee: string;
  isLoading: boolean;
  title: string;
  warning?: string;
};

export const ConfirmUpdateCollectionModal = ({ onConfirm, fee, isLoading, warning, title, ...modalProps }: ConfirmUpdateCollectionModalProps) => {
  const { selectedAccount } = useAccounts();

  const { isBalanceInsufficient } = useBalanceInsufficient(fee);
  return (
    <Modal
      isClosable
      {...modalProps}
    >
      <Heading>{title}</Heading>
      {isLoading && <Loader isFullPage={true} />}
      {warning && (
        <ContentRow>
          <Text>{warning}</Text>
        </ContentRow>
      )}
      <FeeMessage fee={fee} isFeeLoading={false} testid={'fee'} />
      <div>
        <TransferBtn
          role='primary'
          title='Confirm'
          disabled={isLoading || isBalanceInsufficient}
          tooltip={isBalanceInsufficient
            ? `${NOT_ENOUGH_BALANCE_MESSAGE} ${selectedAccount?.unitBalance || 'coins'}`
            : null}
          onClick={onConfirm}
        />
      </div>
    </Modal>
  );
};
