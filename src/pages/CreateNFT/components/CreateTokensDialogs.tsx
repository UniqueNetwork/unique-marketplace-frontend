import { AttributeSchema } from '@unique-nft/schemas';
import { CreateTokenDialog, NewToken } from '../types';
import { AttributesModal } from './AttributesModal';
import { ChangeCollectionModal } from './ChangeCollectionModel';
import { ExceededModal } from './ExceededModal';
import { RemovingModal } from './RemovingModal';
import { TokenTypeEnum } from 'pages/MyTokens/types';
import { AttributeSchemaDto } from '@unique-nft/sdk';

interface CreateTokensDialogsProps {
  dialog?: CreateTokenDialog;
  tokens: NewToken[];
  tokenPrefix: string;
  leftTokens: number | string;
  attributesSchema: Record<number, AttributeSchemaDto> | undefined;
  mode?: 'NFT' | 'ReFungible' | 'Fungible';
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
