import { Attribute, AttributeCount, OfferTokenAttribute } from 'api/restApi/offers/types';
import { NFTToken } from 'api/uniqueSdk/types';
import { AttributeType, DecodedAttributes } from '@unique-nft/substrate-client/tokens';

export const sortAttributeCounts = (attributeCountA: AttributeCount, attributeCountB: AttributeCount) => attributeCountA.numberOfAttributes > attributeCountB.numberOfAttributes ? 1 : -1;

export const attributes = (attributeA: Attribute, attributeB: Attribute) => attributeA.key.localeCompare(attributeB.key);

export const toTokenAttributes = (offerAttributes: OfferTokenAttribute[]) => {
  const result: DecodedAttributes = { };
  offerAttributes.map(({ key, value, type }, index) => {
    const convertedValue = Array.isArray(value) ? value.map((v) => ({ _: v })) : { _: value };
    result[index] = {
      isArray: Array.isArray(value),
      isEnum: type === 'Enum',
      value: convertedValue,
      name: { _: key },
      rawValue: convertedValue,
      type: type as AttributeType
    };
    return result;
  });
  return result;
};

export const getAttributesFromTokens = (tokens: NFTToken[]) => {
  // All attributes from available tokens
  const attributesMap: { [key: string]: any[] } = {};
  // attributes formatted for Filter component
  const attributesForFilter: { [key: string]: Array<{ key: string, count: number }>} = {};

  tokens.forEach(({ attributes }) => {
    if (!attributes) { return; }
    // Calculate filters to show
    for (const i in attributes) {
      const { name, value } = attributes[i];
      const attributeName = name._.toLocaleLowerCase();

      if (Array.isArray(value)) {
        attributesMap[attributeName] = attributesMap[attributeName] ? [...attributesMap[attributeName], ...value.map((attr) => attr._)] : value.map((attr) => attr._);
      } else if (attributes[i].isEnum) {
        attributesMap[attributeName] = attributesMap[attributeName] ? [...attributesMap[attributeName], value._ || value] : [value._ || value];
      }
    }
    // Calculate counts
    for (const attrGroupName in attributesMap) {
      const counterMap: { [key: string]: number } = {};
      attributesMap[attrGroupName].forEach((attrValue) => {
        if (counterMap[attrValue]) counterMap[attrValue]++;
        else counterMap[attrValue] = 1;
      });
      attributesForFilter[attrGroupName] = [];
      for (const attribute of Object.keys(counterMap)) {
        attributesForFilter[attrGroupName].push({ key: attribute, count: counterMap[attribute] });
      }
    }
  });

  return attributesForFilter;
};

export function countTokenAttributes(attributes: DecodedAttributes | undefined): number {
  if (!attributes) return 0;
  let count = 0;
  for (const i in attributes) {
    const { value } = attributes[i];
    if (Array.isArray(value)) {
      count += value.length;
    } else {
      count++;
    }
  }
  return count;
}

export const getAttributesCountFromTokens = (tokens: NFTToken[]) => {
  const countTokensAttributes: number[] = tokens.map(({ attributes }) => countTokenAttributes(attributes));
  // count tokens with the same amount of attributes, result be like { 7: 2, 6: 1 }
  const counterMap: { [key: number]: number } = {};
  countTokensAttributes.forEach((count) => {
    if (counterMap[count]) counterMap[count]++;
    else counterMap[count] = 1;
  });
  // convert to format [{ "numberOfAttributes": 7,"amount": 2 }, { "numberOfAttributes": 6,"amount": 1 }]
  const attributesCountForFilter: AttributeCount[] = [];
  for (const attributesCount in counterMap) {
    attributesCountForFilter.push({ numberOfAttributes: Number(attributesCount), amount: counterMap[attributesCount] });
  }

  return attributesCountForFilter;
};
