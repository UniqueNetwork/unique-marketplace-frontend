import { createContext, Dispatch, FCC, SetStateAction, useState } from 'react';

import { AttributesForFilter, AttributeForFilter } from '../types';

type AttributeFilterContextValue = {
  attributes: AttributesForFilter;
  setAttributes: Dispatch<SetStateAction<AttributesForFilter>>;
  selectedAttributes: AttributeForFilter[];
  setSelectedAttributes: Dispatch<SetStateAction<AttributeForFilter[]>>;
};

export const AttributeFilterContext = createContext<AttributeFilterContextValue>({
  attributes: {},
  setAttributes: () => {},
  selectedAttributes: [],
  setSelectedAttributes: () => {}
});

export const AttributeFilterProvider: FCC = ({ children }) => {
  const [attributes, setAttributes] = useState<AttributesForFilter>({});
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeForFilter[]>([]);

  return (
    <AttributeFilterContext.Provider
      value={{
        attributes,
        selectedAttributes,
        setAttributes,
        setSelectedAttributes
      }}
    >
      {children}
    </AttributeFilterContext.Provider>
  );
};
