import { AttributesDecoded } from '../unique/types';
import { deserializeNft, ProtobufAttributeType } from './protobufUtils';
import { addressToEvm } from '@polkadot/util-crypto';
import { UpDataStructsCreateCollectionData, UpDataStructsProperty } from '@unique-nft/types/default/types';

export const collectionName16Decoder = (name: number[]) => {
  const collectionNameArr = name.map((item: number) => item);

  return String.fromCharCode(...collectionNameArr);
};

export const collectionName8Decoder = (name: number[]) => {
  const collectionNameArr = Array.prototype.slice.call(name);

  return String.fromCharCode(...collectionNameArr);
};

export const hex2a = (hexx: string) => {
  const hex: string = hexx.substring(2);
  let str = '';

  for (let i = 0; i < hex.length && hex.substr(i, 2) !== '00'; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }

  return str;
};

export const decodeStruct = ({ attr, data }: { attr?: any; data?: string }): AttributesDecoded => {
  if (attr && data) {
    try {
      const schema = JSON.parse(attr) as ProtobufAttributeType;

      if (schema?.nested) {
        return deserializeNft(schema, Buffer.from(data.slice(2), 'hex'), 'en');
      }
    } catch (e) {
      console.log('decodeStruct error', e);
    }
  }

  return {};
};

type CollectionProperties = Record<'constOnChainSchema' | 'variableOnChainSchema' | 'offchainSchema' | 'schemaVersion', string>;

export const getCollectionProperties = (collection: UpDataStructsCreateCollectionData): CollectionProperties => {
  return collection?.properties.toArray().reduce<CollectionProperties>((acc, property) => ({
    ...acc,
    [hex2a(property.key.toString()).replace('_old_', '')]: hex2a(property.value.toString())
  }), {
    constOnChainSchema: '',
    variableOnChainSchema: '',
    offchainSchema: '',
    schemaVersion: ''
  });
};

type NFTProperties = Record<'constData', string>;

export const getNFTProperties = (NFTproperties: UpDataStructsProperty[]): NFTProperties => {
  return NFTproperties.reduce<NFTProperties>((acc, property) => ({
      ...acc,
      [hex2a(property.key.toString()).replace('_old_', '')]: property.value.toString()
  }), { constData: '' });
};

// decimals: 15 - opal, 18 - eth
export const subToEthLowercase = (address: string): string => {
  const bytes = addressToEvm(address);

  return '0x' + Buffer.from(bytes).toString('hex');
};
