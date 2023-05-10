import React, { FC, useEffect, useState } from 'react';

import AttributeCountsFilter from 'components/Filters/AttributeCountsFilter';
import AttributesFilter from 'components/Filters/AttributesFilter';
import { AttributeItem } from 'components/Filters/types';
import { Attribute, AttributeCount } from 'api/restApi/offers/types';
import { getAttributesCountFromTokens, getAttributesFromTokens } from './utils/attributes';
import { MixedTokenAndOffer } from 'pages/MyTokens/NFTPage';

interface AttributesFilterSectionProps {
  value?: { collections?: number[], attributes?: { key: string, attribute: string }[], attributeCounts?: number[] } | null
  onChange(collections: number[], attributes?: AttributeItem[], attributeCounts?: number[]): void
  onAttributesChange?(value: { key: string, attribute: string }[]): void
  onAttributeCountsChange?(value: number[]): void
  testid: string
  featuredTokens: MixedTokenAndOffer[]
  tokens: MixedTokenAndOffer[]
  isFetchingTokens: boolean
  featuredTokensForAttributeCounts: MixedTokenAndOffer[]
}

const AttributesFilterSection: FC<AttributesFilterSectionProps> = ({
  value,
  onAttributesChange,
  onAttributeCountsChange,
  testid,
  featuredTokens,
  isFetchingTokens,
  tokens,
  featuredTokensForAttributeCounts
}) => {
  const [attributes, setAttributes] = useState<Record<string, Attribute[]>>({});
  const [attributeCounts, setAttributeCounts] = useState<AttributeCount[]>([]);
  const { collections: selectedCollections = [], attributes: selectedAttributes = [], attributeCounts: selectedAttributeCounts = [] } = value || {};

  useEffect(() => {
    if (!isFetchingTokens && tokens.length > 0) {
      setAttributeCounts(getAttributesCountFromTokens(featuredTokensForAttributeCounts));
    }
  }, [isFetchingTokens, tokens, featuredTokensForAttributeCounts]);

  useEffect(() => {
    if (!isFetchingTokens && featuredTokens.length > 0 && selectedCollections.length === 1) {
      setAttributes(getAttributesFromTokens(featuredTokens));
    }
  }, [isFetchingTokens, featuredTokens, selectedCollections.length]);

  return (<>
    {(!isFetchingTokens && !!attributeCounts.length) && <AttributeCountsFilter
      attributeCounts={attributeCounts}
      selectedAttributeCounts={selectedAttributeCounts}
      onAttributeCountsChange={onAttributeCountsChange}
      isAttributeCountsFetching={isFetchingTokens}
      testid={`${testid}-attribute-count`}
    />}
    {(onAttributesChange && selectedCollections.length === 1) && <AttributesFilter
      attributes={attributes}
      selectedAttributes={selectedAttributes}
      onAttributesChange={onAttributesChange}
      isAttributesFetching={isFetchingTokens}
      testid={`${testid}-attributes`}
    />}
  </>);
};

export default AttributesFilterSection;
