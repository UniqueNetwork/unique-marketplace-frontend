import styled from 'styled-components';

import { Accordion, Checkbox, Text } from 'components/UI';

import { AttributeForFilter, AttributesForFilter, NewToken } from '../types';
import { capitalize, ellipsisText } from '../helpers';

type FilterProps = {
  attributes: AttributesForFilter;
  selectedAttributes: AttributeForFilter[];
  onChange(selectedAttributes: AttributeForFilter[]): void;
};

export const Filter = ({ attributes, selectedAttributes, onChange }: FilterProps) => {
  const onAttributeSelect = (attribute: AttributeForFilter) => (checked: boolean) => {
    if (checked) {
      onChange([...selectedAttributes, attribute]);
    } else {
      onChange(
        selectedAttributes.filter(
          (a) => a.index === attribute.index && a.value !== attribute.value
        )
      );
    }
  };

  const onClear = () => {
    onChange([]);
  };

  return (
    <FilterWrapper>
      {!Object.keys(attributes).length && (
        <Text color='grey-500'>There are no filled attributes</Text>
      )}
      {Object.keys(attributes)
        .sort()
        .map((attributeName) => {
          if (attributes[attributeName].length === 0) {
            return null;
          }
          return (
            <Accordion
              title={capitalize(attributeName)}
              isOpen={true}
              isClearShow={selectedAttributes?.some(
                (attribute) => attributeName === attribute.key
              )}
              key={attributeName}
              onClear={onClear}
            >
              <CollectionFilterWrapper>
                {attributes[attributeName].map((attribute, index) => (
                  <AttributeWrapper key={`attribute-${attribute.key}-${index}`}>
                    <Checkbox
                      checked={selectedAttributes.findIndex(
                        (item) => item.key === attributeName && item.value === attribute.value
                      ) !== -1}
                      label={ellipsisText(attribute.value)}
                      size='m'
                      onChange={onAttributeSelect(attribute)}
                      testid={'select'}
                    />
                    <Text color='grey-500'>{attribute.count.toString()}</Text>
                  </AttributeWrapper>
                ))}
              </CollectionFilterWrapper>
            </Accordion>
          );
        })}
    </FilterWrapper>
  );
};

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  min-width: 300px;
  padding-right: var(--prop-gap);
  gap: var(--prop-gap);
  margin-right: calc(var(--prop-gap) * 2);
  border-right: 1px solid var(--color-grey-300);
`;

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
  padding-right: var(--prop-gap);
  @media (max-width: 1024px) {
    padding-bottom: calc(var(--prop-gap) * 2);
  }
  .unique-checkbox-wrapper label {
    max-width: 230px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const AttributeWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding-right: 8px;
  box-sizing: border-box;
`;
