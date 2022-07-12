import { Attribute, AttributeCount } from '../../../api/restApi/offers/types';

export const sortAttributeCounts = (attributeCountA: AttributeCount, attributeCountB: AttributeCount) => attributeCountA.numberOfAttributes > attributeCountB.numberOfAttributes ? 1 : -1;

export const sortAttributes = (attributeA: Attribute, attributeB: Attribute) => attributeA.key.localeCompare(attributeB.key);
