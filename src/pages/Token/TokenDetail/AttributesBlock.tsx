import React, { FC, useMemo } from 'react';
import { Attribute } from '@unique-nft/sdk';
import styled from 'styled-components';
import { Heading, Text } from 'components/UI';
import { Trait } from './Trait';
import IconWithHint from '../../../components/IconWithHint/IconWithHint';
import { useQueryAttributes } from 'api/scanApi/useQueryAttributes';
import { useQueryCollectionTokensCount } from 'api/scanApi/useQueryCollectionTokensCount';

interface StatItem {
  count: number;
}

interface IProps {
  attributes: Attribute[];
  collectionId: number;
}

export const AttributesBlock: FC<IProps> = ({ attributes, collectionId }) => {
  const { tokensCount } = useQueryCollectionTokensCount(collectionId);
  const { attributes: attributeStatistics, isFetching } = useQueryAttributes(collectionId);

  const statistics = useMemo(() => {
    const result: Record<string, StatItem> = {};
    
    attributeStatistics.forEach((stat) => {
      const key = `${stat.traitType}_${stat.value}`;
      result[key] = { count: stat.count };
    });
    
    return result;
  }, [attributeStatistics]);

  return (
    <div>
      <HeadingWrapper>
        <HeadingStyled size={'4'}>Attributes</HeadingStyled>
        <IconWithHint
          align={{
            appearance: 'horizontal',
            horizontal: 'right',
            vertical: 'middle',
          }}
        >
          Special features of the token that the collection creator specifies
          when minting
        </IconWithHint>
      </HeadingWrapper>
      <AttributesWrapper>
        {attributes.map((attribute, index) => (
          <AttributesRow
            key={index}
            attribute={attribute.trait_type}
            enumeration={attribute.value.toString()}
            isFetching={isFetching}
            tokensCount={tokensCount}
            percents={
              ((statistics[`${attribute.trait_type}_${attribute.value.toString()}`]?.count || 0) * 100) /
              tokensCount
            }
          />
        ))}
      </AttributesWrapper>
    </div>
  );
};

const AttributesRow = ({
  attribute,
  enumeration,
  isFetching,
  tokensCount,
  percents,
}: {
  attribute: string;
  enumeration: string;
  isFetching: boolean;
  tokensCount: number;
  percents: number;
}) => (
  <AttributeCard>
    <Text color='grey-500' size='s' weight='bold'>
      {attribute.toUpperCase()}
    </Text>
    <Row>
      <Trait trait={enumeration} />
    </Row>
    {!isFetching && typeof percents === 'number' && isFinite(percents) && percents > 0 && (
      <Row>
        <Text size='s' color='grey-500'>
          {percents.toFixed(0)}%
        </Text>
      </Row>
    )}
  </AttributeCard>
);

const HeadingWrapper = styled.div`
  display: flex;
  align-items: self-end;
  margin-bottom: 16px;
  column-gap: calc(var(--prop-gap) / 2);

  & > h4.unique-font-heading {
    margin-bottom: 0px;
  }

  & > div {
    height: 24px;
  }
`;

const AttributesWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;

  @media (max-width: 1280px) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const AttributeCard = styled.div`
  background: var(--color-blue-grey-100);
  border-radius: 4px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
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
  gap: 12px;
`;