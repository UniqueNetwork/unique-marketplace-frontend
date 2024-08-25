import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ItemCount, TraitCount, getDescriptionCounts, getNameCounts, getTraitCounts } from '../helpers';
import { Accordion } from 'components/UI';
import { NewToken2 } from '../types';
import { TextInput } from 'components/TextInput/TextInput';
import { Checkbox } from 'components/UI/Checkbox/Checkbox2';

const FilterContainer = styled.div`
  margin-bottom: 20px;
  .input-wrapper.with-icon.to-left:not(.to-right) input,
  .input-wrapper.with-icon.to-left.to-right input {
    padding: 8px 12px 8px 0 !important;
    max-height: 32px !important;
  }

  .input-wrapper.with-icon:last-of-type svg {
    margin-bottom: -4px;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  &:first-of-type {
    margin-top: 16px;
  }
`;

const AttributeCount = styled.div`
  background-color: var(--color-grey-100);
  color: var(--color-grey-700);
  border-radius: 12px;
  margin-left: auto;
  padding: 0 8px;
`;

const TextInputStyled = styled(TextInput)`
  width: 100%;
  margin-top: 16px;
`;

const AccordionStyled = styled(Accordion)`
  margin-bottom: 16px;
`;

type FilterProps = {
  tokens: NewToken2[];
  onFilterChange: (filters: {
    attributes: { [key: string]: string[] };
    name: string[];
    description: string[];
  }) => void;
};

const FilterComponent: React.FCC<FilterProps> = ({ onFilterChange, tokens }) => {
  const [attributes, setAttributes] = useState<TraitCount[]>([]);
  const [names, setNames] = useState<ItemCount[]>([]);
  const [descriptions, setDescriptions] = useState<ItemCount[]>([]);
  const [filteredNames, setFilteredNames] = useState<ItemCount[]>([]);
  const [filteredDescriptions, setFilteredDescriptions] = useState<ItemCount[]>([]);

  useEffect(() => {
    const attributeCounts = getTraitCounts(tokens);
    const nameCounts = getNameCounts(tokens);
    const descriptionCounts = getDescriptionCounts(tokens);

    setAttributes(attributeCounts);
    setNames(nameCounts);
    setFilteredNames(nameCounts);
    setDescriptions(descriptionCounts);
    setFilteredDescriptions(descriptionCounts);
  }, [tokens]);

  const [selectedAttributes, setSelectedAttributes] = useState<{
    [key: string]: string[];
  }>({});

  const [nameFilter, setNameFilter] = useState<string[]>([]);
  const [descriptionFilter, setDescriptionFilter] = useState<string[]>([]);

  const handleAttributeChange = useCallback((trait_type: string, value: string) => {
    setSelectedAttributes((prev) => {
      const updated = { ...prev };
      if (!updated[trait_type]) {
        updated[trait_type] = [];
      }
      if (updated[trait_type].includes(value)) {
        updated[trait_type] = updated[trait_type].filter((v) => v !== value);
      } else {
        updated[trait_type].push(value);
      }
      return updated;
    });
  }, []);

  const [name, setName] = useState('');
  const handleNameChange = (value: string) => {
    setName(value);
    const filtered = names.filter((name) =>
      name.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredNames(filtered);
    setNameFilter([]);
  };

  const [description, setDescription] = useState('');
  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    const filtered = descriptions.filter((description) =>
      description.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDescriptions(filtered);
    setDescriptionFilter([]);
  };

  const handleNameSelect = (value: string) => {
    setNameFilter((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      }
      return [...prev, value];
    });
  };

  const handleDescriptionSelect = (value: string) => {
    setDescriptionFilter((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      }
      return [...prev, value];
    });
  };

  const handleFilterChange = () => {
    onFilterChange({
      attributes: selectedAttributes,
      name: nameFilter,
      description: descriptionFilter
    });
  };

  useEffect(() => {
    handleFilterChange();
  }, [selectedAttributes, nameFilter, descriptionFilter]);

  return (
    <FilterContainer>
      {filteredNames && (
        <AccordionStyled title={'Name'} isOpen={true}>
          <TextInputStyled
            placeholder=''
            allowSpaces={true}
            iconLeft={{
              size: 15,
              name: 'magnify',
              color: 'var(--color-grey-200)'
            }}
            value={name}
            onChange={handleNameChange}
          />
          {filteredNames.map((name, index) => (
            <CheckboxLabel key={'name' + name + '_' + index}>
              <Checkbox
                checked={nameFilter.some((item) => item === name.name)}
                label={name.name}
                size={'m'}
                onChange={() => handleNameSelect(name.name)}
                testid={''}
              />
              <AttributeCount>{name.count}</AttributeCount>
            </CheckboxLabel>
          ))}
        </AccordionStyled>
      )}

      {filteredDescriptions && (
        <AccordionStyled title={'Description'} isOpen={true}>
          <TextInputStyled
            placeholder=''
            allowSpaces={true}
            iconLeft={{
              size: 15,
              name: 'magnify',
              color: 'var(--color-grey-200)'
            }}
            value={description}
            onChange={handleDescriptionChange}
          />
          {filteredDescriptions.map((description, index) => (
            <CheckboxLabel key={'description' + description + '_' + index}>
              <Checkbox
                checked={descriptionFilter.some(
                  (item) => item === description.name
                )}
                label={description.name}
                size={'m'}
                onChange={() => handleDescriptionSelect(description.name)}
                testid={''}
              />
              <AttributeCount>{description.count}</AttributeCount>
            </CheckboxLabel>
          ))}
        </AccordionStyled>
      )}
      {attributes && (
        <>
          {attributes.map((attribute, index) => (
            <AccordionStyled
              key={`attr_${attribute.trait_type}_${index}`}
              title={attribute.trait_type}
              isOpen={true}
            >
              {attribute.items.map((item, itemIndex) => (
                <CheckboxLabel
                  key={`attr_checkbox_${attribute.trait_type}_${itemIndex}`}
                >
                  <Checkbox
                    checked={selectedAttributes[attribute.trait_type]?.includes(
                      item.value
                    )}
                    label={item.value}
                    size={'m'}
                    onChange={() =>
                      handleAttributeChange(attribute.trait_type, item.value)
                    }
                    testid={''}
                  />
                  <AttributeCount>{item.count}</AttributeCount>
                </CheckboxLabel>
              ))}
            </AccordionStyled>
          ))}
        </>
      )}
    </FilterContainer>
  );
};

export default FilterComponent;
