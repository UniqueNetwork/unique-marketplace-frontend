import { Heading } from '@unique-nft/ui-kit';
import { Button, Modal, Text } from 'components/UI';
import { ModalProps } from 'components/UI/Modal';

type ReachedTokensLimitModalProps = Pick<ModalProps, 'isVisible' | 'onClose'>;

export const ReachedTokensLimitModal = ({
  isVisible,
  onClose
}: ReachedTokensLimitModalProps) => {
  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
    >
      <Heading>Token limit reached</Heading>
      <Text>
        Unfortunately you&apos;ve reached token limit for&nbsp;your collection
      </Text>
      <div>
        <Button role='primary' title='Close' onClick={onClose} />
      </div>
    </Modal>
  );
};
