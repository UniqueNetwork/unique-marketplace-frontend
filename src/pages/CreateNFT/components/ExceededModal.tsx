import styled from 'styled-components';

import { Button, Modal, Text } from 'components/UI';

import { MAX_MINT_TOKENS } from '../CreateNFT';
import { ModalFooter } from './ModalFooter';
import { Heading } from '@unique-nft/ui-kit';

type ExceededModalProps = {
  isVisible?: boolean;
  tokensCount: number;
  leftTokens: number | string;
  onClose(): void;
};

export const ExceededModal = ({
  isVisible = true,
  tokensCount,
  leftTokens,
  onClose
}: ExceededModalProps) => {
  const toMax = MAX_MINT_TOKENS - tokensCount;
  const toLimit = leftTokens !== 'Unlimited' ? leftTokens : MAX_MINT_TOKENS;
  const message =
    toMax < Number(toLimit)
      ? `It is only possible to add ${toMax} more files because it is only allowed to create ${MAX_MINT_TOKENS} tokens at a time.`
      : `It is only possible to add ${toLimit} more files because collection has minting limit of tokens.`;
  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <Heading>Too many files</Heading>
      <ModalContent>
        <Text>{message}</Text>
        <Text>Please select the correct number of files.</Text>
      </ModalContent>
      <ModalFooter>
        <Button role='outlined' title='Close' onClick={onClose} />
      </ModalFooter>
    </Modal>
  );
};

export const ModalContent = styled.div`
  margin-bottom: var(--prop-gap);
  display: flex;
  flex-direction: column;
`;
