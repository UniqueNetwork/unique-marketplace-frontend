import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { Heading, Text } from 'components/UI';
import { Trait } from './Trait';
import IconWithHint from '../../../components/IconWithHint/IconWithHint';
import { DecodedAttributeDto } from '@unique-nft/sdk';
import { useQueryAttributes } from 'api/scanApi/useQueryAttributes';
import { useQueryCollectionTokensCount } from 'api/scanApi/useQueryCollectionTokensCount';

interface IProps {
  attributes: DecodedAttributeDto[];
  collectionId: number;
}

export const AttributesBlock: FC<IProps> = ({ attributes, collectionId }: IProps) => {
  const { tokensCount } = useQueryCollectionTokensCount(collectionId);
  const { attributes: attributeStatistics, isFetching } = useQueryAttributes(collectionId);

  const statistics = useMemo(() => {
    return attributeStatistics.reduce<Record<string, { count: number, value: string }[]>>((acc, { name, values }) => {
      acc[name._] = values.map(({ tokens_count, value }) => ({ count: tokens_count, value: value._ }));
      return acc;
    }, {});
  }, [attributeStatistics]);

  return (
    <div>
      <HeadingWrapper>
        <HeadingStyled size={'4'}>Attributes</HeadingStyled>
        <IconWithHint align={{ appearance: 'horizontal', horizontal: 'right', vertical: 'middle' }}>
          Special features of the token that the collection creator specifies when minting
        </IconWithHint>
      </HeadingWrapper>
      <AttributesWrapper>
        {Object.values(attributes).map((attribute, index) => {
          return <AttributesRow
            key={index}
            attribute={typeof attribute.name === 'string' ? attribute.name : attribute?.name?._ || ''}
            enumeration={Array.isArray(attribute.value)
              ? attribute.value.map((item: { _: string | number }) => item._.toString())
              : typeof attribute.value === 'string' ? attribute.value : attribute.value._.toString()
            }
            isFetching={isFetching}
            tokensCount={tokensCount}
            statistics={statistics}
          />;
        })}
      </AttributesWrapper>
    </div>
  );
};

const AttributesRow = ({
  attribute,
  enumeration,
  isFetching,
  statistics,
  tokensCount
}: {
  attribute: string;
  enumeration: string | string[];
  isFetching: boolean;
  tokensCount: number;
  statistics: Record<string, {
    count: number;
    value: string;
  }[]> | undefined;
}) => {
  const percents = useMemo(() => {
    if (typeof enumeration === 'string') {
      const count = statistics?.[attribute]?.find(({ value }) => value === enumeration)?.count || 0;
      return tokensCount ? (count / tokensCount) * 100 : 0;
    }
    if (!tokensCount) return [];
    return enumeration.map((item) => (statistics?.[attribute]?.find(({ value }) => value === item)?.count || 0) / tokensCount * 100);
  }, [attribute, enumeration, statistics, tokensCount]);

  if (typeof enumeration === 'string') {
    return (
      <AttributeCard key={attribute}>
        <Text color='grey-500' size='s' weight='bold'>
          {attribute.toUpperCase()}
        </Text>
        <Row><Trait trait={enumeration} /></Row>
        {!isFetching && typeof percents === 'number' && <Row><Text size='s' color='grey-500'>{percents.toFixed(0)}%</Text></Row>}
      </AttributeCard>
    );
  }

  return (<>
    {enumeration.map((trait, index) => <AttributeCard key={`${attribute}_${index}`}>
      <Text color='grey-500' size='s' weight='bold'>
        {attribute.toUpperCase()}
      </Text>
      <Row><Trait key={trait} trait={trait} /></Row>
      {Array.isArray(percents) && !!percents[index] && <Row><Text size='s' color='grey-500'>{percents[index].toFixed(0)}%</Text></Row>}
      {!isFetching && typeof percents === 'number' && <Row><Text size='s' color='grey-500'>{percents.toFixed(0)}%</Text></Row>}
    </AttributeCard>)}
  </>);
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

const AttributesWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
  @media (max-width:1280px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
  @media (max-width:768px) {
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
