import styled from 'styled-components';
import { Text } from '@unique-nft/ui-kit';
import { Tooltip } from 'components/UI';
import { useRef } from 'react';

export const CollectionTitle = ({
  collectionId,
  collectionName
}: {
  collectionName: string;
  collectionId: number;
}) => {
  const collectionNameRef = useRef<HTMLDivElement>(null);
  return <CollectionTitleWrapper ref={collectionNameRef}>
    <Text color='primary-600' size='s' >
      {collectionName}
    </Text>
    {/* <Text color='primary-600' size='s'>
      [id {collectionId}]
    </Text> */}
    <Tooltip
      align={{ vertical: 'top', horizontal: 'middle', appearance: 'vertical' }}
      targetRef={collectionNameRef}
    >
      {collectionName}
    </Tooltip>
  </CollectionTitleWrapper>;
};

const CollectionTitleWrapper = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px;
  width: auto;


  & > span {
    white-space: nowrap;
  }
  & > span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    
  }
`;
