import { AttributesDecoded } from '../../chainApi/unique/types';
import { AnyObject, CollectionFields, CollectionSelectField } from '@unique-nft/sdk/types';

const getFieldItem = (fields: CollectionFields, key: string, prop: string) => {
  const field = fields?.find((field) => field.name === key && field.type === 'select');
  if (field) {
    const index = Number(prop.split('_')[1]);
    return JSON.parse((field as CollectionSelectField).items[index]).en;
  }
  return '';
};

export const getAttributes = (constData: AnyObject | undefined, fields: CollectionFields | undefined) => constData
  ? Object.keys(constData).reduce<AttributesDecoded>((attributes, attributeKey) => {
    if (Array.isArray(constData[attributeKey])) {
      attributes[attributeKey] = constData[attributeKey].map((item: string) => /PROP_\d+/.test(item) && fields ? getFieldItem(fields, attributeKey, item) : item);
    } else {
      attributes[attributeKey] = constData[attributeKey];
    }
    return attributes;
  }, {})
  : {};
