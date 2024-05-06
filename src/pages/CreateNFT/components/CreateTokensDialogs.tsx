import { CreateTokenDialog, NewToken } from '../types';
import { AttributesModal } from './AttributesModal';
import { ChangeCollectionModal } from './ChangeCollectionModel';
import { ExceededModal } from './ExceededModal';
import { RemovingModal } from './RemovingModal';
import { PotentialAttribute } from '@unique-nft/sdk';

interface CreateTokensDialogsProps {
  dialog?: CreateTokenDialog;
  tokens: NewToken[];
  tokenPrefix: string;
  leftTokens: number | string;
  attributesSchema: PotentialAttribute[] | undefined;
  mode?: 'NFT' | 'ReFungible' | 'Fungible';
  schemaVersion: string;
  onChange(tokens: NewToken[]): void;
  onConfirm(): void;
  onClose(): void;
}

export const CreateTokensDialogs = ({
  dialog,
  tokens,
  tokenPrefix,
  leftTokens,
  attributesSchema,
  mode,
  schemaVersion,
  onChange,
  onConfirm,
  onClose
}: CreateTokensDialogsProps) => {
  switch (dialog) {
    case CreateTokenDialog.changeCollection:
      return <ChangeCollectionModal onSubmit={onConfirm} onClose={onClose} />;
    case CreateTokenDialog.editAttributes:
      return (
        <AttributesModal
          tokens={tokens}
          tokenPrefix={tokenPrefix}
          attributesSchema={attributesSchema || []}
          mode={mode}
          schemaVersion={schemaVersion}
          onChange={onChange}
          onClose={onClose}
        />
      );
    case CreateTokenDialog.removeToken:
      return <RemovingModal tokens={tokens} onSubmit={onConfirm} onClose={onClose} />;
    case CreateTokenDialog.exceededTokens:
      return (
        <ExceededModal
          tokensCount={tokens.length}
          leftTokens={leftTokens}
          onClose={onClose}
        />
      );
    default:
      return null;
  }
};
