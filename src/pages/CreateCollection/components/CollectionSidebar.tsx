import { memo, VFC } from 'react';
import { CollectionForm } from '../types';
import styled from 'styled-components';
import { Card } from './Card';
import { getTokenIpfsUriByImagePath } from '../helpers';
import { Heading } from 'components/UI';

export const CollectionSidebarComponent: VFC<{
  collectionForm: CollectionForm;
  className?: string;
}> = ({ collectionForm, className }) => {
  const { name, description, symbol, coverPictureIpfsCid, attributes } = collectionForm;

  const attributesInline = attributes?.map<string>((attr) => attr.name || '');

  return (
    <WrapperSidebar className={className}>
      <SidebarRow>
        <Heading size='3'>Collection preview</Heading>
        <Card
          title={name || 'Name'}
          description={description || 'Description'}
          picture={getTokenIpfsUriByImagePath(coverPictureIpfsCid)}
        />
      </SidebarRow>
      <SidebarRow>
        <Heading size='3'>Token preview</Heading>
        <Card
          // TODO: пустой массив
          attributesInline={attributesInline}
          title={symbol || 'Symbol'}
          description={name || 'Collection name'}
          geometry='square'
          picture={undefined}
        />
      </SidebarRow>
    </WrapperSidebar>
  );
};

export const CollectionSidebar = memo(CollectionSidebarComponent);

export const WrapperSidebar = styled.aside`
  box-sizing: border-box;
  overflow: hidden;
  margin: calc(var(--prop-gap) * 2) 0;

  @media screen and (min-width: 1025px) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-radius: var(--prop-border-radius);
    padding: calc(var(--prop-gap) * 2);
    background-color: var(--color-additional-light);
    flex: 1 1 33.3333%;
    max-width: 600px;
    margin: 0 0 0 calc(var(--prop-gap) * 2);
  }

  @media only screen and (min-width: 1025px) and (max-width: 1500px) {
    margin: 0 0 0 calc(var(--prop-gap) * 1.5);
  }
`;

export const SidebarRow = styled.div`
  &:not(:last-child) {
    margin-bottom: 40px;
  }
`;
