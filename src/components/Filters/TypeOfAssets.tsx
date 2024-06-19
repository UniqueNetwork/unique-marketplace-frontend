import React, { FC, useCallback } from 'react';
import { Checkbox } from 'components/UI';
import styled from 'styled-components';

import { Accordion } from 'components/Accordion/Accordion';
import CheckboxSkeleton from 'components/Skeleton/CheckboxSkeleton';
import { TypeOfAssets } from './types';

interface TypeOfAssetsFilterProps {
  value?: TypeOfAssets
  onChange(value?: TypeOfAssets): void
  testid: string
  isFetchingTokens: boolean
}

const TypeOfAssetsFilter: FC<TypeOfAssetsFilterProps> = ({
  value,
  onChange,
  testid,
  isFetchingTokens
}) => {
  const onCheckboxClick = useCallback((newValue: TypeOfAssets) => (checked: boolean) => {
    if (checked) {
      if (value === TypeOfAssets.CustomizableNFTs || value === TypeOfAssets.NFTs) {
        onChange(TypeOfAssets.All);
        return;
      }
      onChange(newValue);
    } else {
      if (value === TypeOfAssets.All) {
        onChange(newValue === TypeOfAssets.CustomizableNFTs ? TypeOfAssets.NFTs : TypeOfAssets.CustomizableNFTs);
        return;
      }
      onChange(undefined);
    }
  }, [onChange, value]);

  const onClear = useCallback(() => { onChange(undefined); }, [onChange]);

  return (<>
    <Accordion title={'Type of Assets'}
      isOpen={true}
      onClear={onClear}
      isClearShow={!!value}
    >
      <CollectionFilterWrapper>
        {isFetchingTokens && Array.from({ length: 3 }).map((_, index) => <CheckboxSkeleton key={`checkbox-skeleton-${index}`} />)}
        <CheckboxWrapper>
          <Checkbox
            checked={value === TypeOfAssets.NFTs || value === TypeOfAssets.All}
            label={'NFTs'}
            size={'m'}
            onChange={onCheckboxClick(TypeOfAssets.NFTs)}
            testid={`${testid}-checkbox-nfts`}
          />
        </CheckboxWrapper>
        <CheckboxWrapper>
          <Checkbox
            checked={value === TypeOfAssets.CustomizableNFTs || value === TypeOfAssets.All}
            label={'Customizable NFTs'}
            size={'m'}
            onChange={onCheckboxClick(TypeOfAssets.CustomizableNFTs)}
            testid={`${testid}-checkbox-customizable-nfts`}
          />
        </CheckboxWrapper>
      </CollectionFilterWrapper>
    </Accordion>
  </>);
};

const CollectionFilterWrapper = styled.div`
  position: relative;
  margin-top: var(--prop-gap);
  padding-top: 2px;
  display: flex;
  flex-direction: column;
  row-gap: var(--prop-gap);
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
  column-gap: calc(var(--prop-gap) / 4);
  align-items: flex-start;
`;

export default TypeOfAssetsFilter;
