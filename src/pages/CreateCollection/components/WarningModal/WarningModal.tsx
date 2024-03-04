import { Confirm, Text } from 'components/UI';

type WarningModalProps = {
  warning?: { title: string; description: string };
  onCancel(): void;
  onConfirm(): void;
};

export const WarningModal = ({ warning, onCancel, onConfirm }: WarningModalProps) => {
  return (
    <Confirm
      buttons={[
        { title: 'No, return', onClick: onCancel },
        {
          title: 'Yes, I am sure',
          role: 'primary',
          type: 'submit',
          onClick: onConfirm
        }
      ]}
      isVisible={!!warning}
      title={warning?.title}
      onClose={onCancel}
    >
      <Text>{warning?.description}</Text>
    </Confirm>
  );
};
