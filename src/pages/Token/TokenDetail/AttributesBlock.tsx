import React, { FC } from 'react';
import styled from 'styled-components';
import { Heading, Text } from '@unique-nft/ui-kit';
import { Trait } from './Trait';
import { DecodedAttributes, LocalizedStringDictionary } from '@unique-nft/sdk/tokens';

interface IProps {
  attributes: DecodedAttributes;
}

export const AttributesBlock: FC<IProps> = ({ attributes }: IProps) => {
  const AttributesRow = ({
    attribute,
    enumeration
  }: {
    attribute: string;
    enumeration: string | string[];
  }) => (
    <React.Fragment key={attribute}>
      <Text color='grey-500' size='m'>
        {attribute}
      </Text>
      <Row>
        {typeof enumeration === 'string'
        ? (<Trait trait={enumeration} />)
        : (enumeration.map((trait) => <Trait key={trait} trait={trait} />))}
      </Row>
    </React.Fragment>
  );

  return (
    <div>
      <HeadingStyled size={'4'}>Attributes</HeadingStyled>
      {Object.values(attributes).map((attribute) => {
        return AttributesRow({
          attribute: typeof attribute.name === 'string' ? attribute.name : attribute?.name?.en || '',
          enumeration: Array.isArray(attribute.value) ? attribute.value.map((item) => (item as LocalizedStringDictionary).en || item.toString()) : attribute.value as string
        });
      })}
    </div>
  );
};

const HeadingStyled = styled(Heading)`
  && {
    margin-bottom: 16px;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  > div {
    margin-top: 10px;
  }

  &:not(:last-of-type) {
    margin-bottom: 16px;
  }
`;
