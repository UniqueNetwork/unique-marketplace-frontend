import { FC } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NewToken2, ViewMode } from '../types';
import { TokenLine } from './TokenLine';

type SortableTokenListProps = {
  tokens: NewToken2[];
  viewMode: ViewMode;
  mode: 'NFT' | 'Fungible' | 'ReFungible' | undefined;
  tokenPrefix: string;
  attributesSchema: any;
  step: any;
  newAttributes: string[];
  setNewAttributeValue: (payload: any) => void;
  onChange: (tokens: NewToken2[]) => void;
  onRemove: (id: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  tokensStartId?: number;
};

export const SortableTokenList: FC<SortableTokenListProps> = ({
  tokens,
  viewMode,
  mode,
  tokenPrefix,
  attributesSchema,
  step,
  newAttributes,
  setNewAttributeValue,
  onChange,
  onRemove,
  containerRef,
  tokensStartId,
}) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = ({ active, over }: { active: any; over: any }) => {
    if (active.id !== over.id) {
      const oldIndex = tokens.findIndex((token) => token.id === active.id);
      const newIndex = tokens.findIndex((token) => token.id === over.id);
      const reorderedTokens = arrayMove(tokens, oldIndex, newIndex);

      const lastId = (tokensStartId || 0) + 1;
      const updatedTokens = reorderedTokens.map((token, index) => ({
        ...token,
        tokenId: lastId + index,
      }));

      onChange(updatedTokens);
    }
  };

  const handleTokenChange = (updatedToken: NewToken2) => {
    const updatedTokens = tokens.map((token) =>
      token.id === updatedToken.id ? updatedToken : token
    );
    onChange(updatedTokens);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={tokens.map((token) => token.id)} strategy={verticalListSortingStrategy}>
        <div ref={containerRef}>
          {tokens.map((token, index) => (
            <SortableTokenItem
              key={token.id}
              token={token}
              index={index}
              viewMode={viewMode}
              mode={mode}
              tokenPrefix={tokenPrefix}
              attributesSchema={attributesSchema}
              step={step}
              newAttributes={newAttributes}
              setNewAttributeValue={setNewAttributeValue}
              onChange={handleTokenChange}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

// SortableTokenItem for individual tokens
const SortableTokenItem: FC<{
  token: NewToken2;
  index: number;
  viewMode: ViewMode;
  mode: 'NFT' | 'Fungible' | 'ReFungible' | undefined;
  tokenPrefix: string;
  attributesSchema: any;
  step: any;
  newAttributes: string[];
  setNewAttributeValue: (payload: any) => void;
  onChange: (token: NewToken2) => void;
  onRemove: (id: number) => void;
}> = ({
  token,
  index,
  viewMode,
  mode,
  tokenPrefix,
  attributesSchema,
  step,
  newAttributes,
  setNewAttributeValue,
  onChange,
  onRemove,
}) => {
  const { setNodeRef, transform, transition } = useSortable({ id: token.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '0',
    marginBottom: '10px',
    backgroundColor: '#fff',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TokenLine
        item={token}
        commonProps={{
          viewMode,
          mode,
          tokenPrefix,
          attributesSchema,
          step,
          newAttributes,
          setNewAttributeValue,
          onChange,
          onRemove,
        }}
      />
    </div>
  );
};
