import React, { FC, useCallback } from 'react';
import { Checkbox } from 'components/UI';
import styled from 'styled-components';

import { Accordion } from 'components/Accordion/Accordion';
import CheckboxSkeleton from 'components/Skeleton/CheckboxSkeleton';
import { TypeOfCustomizableNFTs } from './types';

interface TypeOfCustomizablesFilterProps {
  value?: TypeOfCustomizableNFTs
  onChange(value?: TypeOfCustomizableNFTs): void
  testid: string
  isFetchingTokens: boolean
}

const TypeOfCustomizablesFilter: FC<TypeOfCustomizablesFilterProps> = ({
  value,
  onChange,
  testid,
  isFetchingTokens
}) => {
  const onCheckboxClick = useCallback((value: TypeOfCustomizableNFTs) => (checked: boolean) => {
    if (checked) {
      onChange(value);
    } else {
      onChange(undefined);
    }
  }, [onChange]);

  const onClear = useCallback(() => { onChange(undefined); }, [onChange]);

  return (<>
    <Accordion title={'Types of Customizable NFTs'}
      isOpen={true}
      onClear={onClear}
      isClearShow={!!value}
    >
      <CollectionFilterWrapper>
        {isFetchingTokens && Array.from({ length: 3 }).map((_, index) => <CheckboxSkeleton key={`checkbox-skeleton-${index}`} />)}
        <CheckboxWrapper>
          <Checkbox
            checked={value === TypeOfCustomizableNFTs.Base}
            label={'Base NFTs'}
            size={'m'}
            onChange={onCheckboxClick(TypeOfCustomizableNFTs.Base)}
            testid={`${testid}-checkbox-nfts`}
          />
        </CheckboxWrapper>
        <CheckboxWrapper>
          <Checkbox
            checked={value === TypeOfCustomizableNFTs.Wearables}
            label={'NFT Wearables'}
            size={'m'}
            onChange={onCheckboxClick(TypeOfCustomizableNFTs.Wearables)}
            testid={`${testid}-checkbox-customizable-nfts`}
          />
        </CheckboxWrapper>
      </CollectionFilterWrapper>
    </Accordion>
  </>);
};

const CollectionFilterWrapper = styled.div`
  position: relative;
  margin-top: var(--gap);
  padding-top: 2px;
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
  min-height: 50px;
  max-height: 400px;
  overflow-y: auto;
  .unique-checkbox-wrapper label {
    max-width: 230px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 4);
  align-items: flex-start;
`;

export default TypeOfCustomizablesFilter;
