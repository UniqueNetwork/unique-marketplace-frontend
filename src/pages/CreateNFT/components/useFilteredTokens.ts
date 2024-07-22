import { useState, useEffect } from 'react';
import { NewToken2 } from '../types';

export enum SpecialFilters {
  NoName = 'No name',
  NoDescription = 'No description'
}

type Filters = {
  attributes: { [key: string]: string[] };
  name: string[];
  description: string[];
};

const useFilteredTokens = (tokens: NewToken2[], filters: Filters) => {
  const [filteredTokens, setFilteredTokens] = useState<NewToken2[]>([]);

  useEffect(() => {
    let filtered = tokens;

    if (filters.attributes) {
      filtered = filtered.filter((token) => {
        return Object.keys(filters.attributes).every((trait_type) => {
          return filters.attributes[trait_type].every((value) =>
            token.attributes.some(
              (attribute) =>
                attribute.trait_type === trait_type && attribute.value === value
            )
          );
        });
      });
    }

    if (filters.name.length > 0) {
      filtered = filtered.filter((token) => {
        const hasNoName = filters.name.includes(SpecialFilters.NoName) && !token.name;
        const hasName = filters.name.includes(token.name || '');
        return hasNoName || hasName;
      });
    }

    if (filters.description.length > 0) {
      filtered = filtered.filter((token) => {
        const hasNoDescription = filters.description.includes(SpecialFilters.NoDescription) && !token.description;
        const hasDescription = filters.description.includes(token.description || '');
        return hasNoDescription || hasDescription;
      });
    }

    setFilteredTokens(filtered);
  }, [tokens, filters]);

  return filteredTokens;
};

export default useFilteredTokens;