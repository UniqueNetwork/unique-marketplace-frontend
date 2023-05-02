import React, { FC } from 'react';
import styled from 'styled-components';
import { Heading, Text } from '@unique-nft/ui-kit';
import { Trait } from './Trait';
import IconWithHint from '../../../components/IconWithHint/IconWithHint';
import { DecodedAttributeDto } from '@unique-nft/sdk';

interface IProps {
  attributes: DecodedAttributeDto[];
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
      <HeadingWrapper>
        <HeadingStyled size={'4'}>Attributes</HeadingStyled>
        <IconWithHint align={{ appearance: 'horizontal', horizontal: 'right', vertical: 'middle' }}>
          Special features of the token that the collection creator specifies when minting
        </IconWithHint>
      </HeadingWrapper>
      {Object.values(attributes).map((attribute) => {
        return AttributesRow({
          attribute: typeof attribute.name === 'string' ? attribute.name : attribute?.name?._ || '',
          enumeration: Array.isArray(attribute.value)
            ? attribute.value.map((item: { _: string | number }) => item._.toString())
            : typeof attribute.value === 'string' ? attribute.value : attribute.value._.toString()
        });
      })}
    </div>
  );
};

const HeadingWrapper = styled.div`
  display: flex;
  align-items: self-end;
  margin-bottom: 16px;
  column-gap: calc(var(--gap) / 2);
  & > h4.unique-font-heading {
    margin-bottom: 0px;
  }
  & > div {
    height: 24px;
  }
`;

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
