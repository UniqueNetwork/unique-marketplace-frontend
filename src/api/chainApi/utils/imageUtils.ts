import { MetadataType } from '../unique/types';
import { getCollectionProperties } from './decoder';
import { UpDataStructsCreateCollectionData } from '@unique-nft/types/default/types';

export const getTokenImageUrl = (urlString: string, tokenId: number): string => {
  if (urlString.indexOf('{id}') !== -1) {
    return urlString.replace('{id}', tokenId.toString());
  }

  return urlString;
};

// uses for token image path
export const fetchTokenImage = async (
  collectionMetadata: MetadataType,
  tokenId: number
): Promise<string> => {
  try {
    if (collectionMetadata.metadata) {
      const dataUrl = getTokenImageUrl(collectionMetadata.metadata, tokenId);
      const urlResponse = await fetch(dataUrl);
      const jsonData = (await urlResponse.json()) as { image: string };

      return jsonData.image;
    }
  } catch (e) {
    console.log('image metadata parse error', e);
  }

  return '';
};

export const getTokenImage = async (collection: UpDataStructsCreateCollectionData, tokenId: number): Promise<string> => {
  const { schemaVersion, offchainSchema } = getCollectionProperties(collection);
  if (schemaVersion === 'ImageURL') {
    return getTokenImageUrl(offchainSchema, tokenId);
  } else if (schemaVersion === 'tokenURI') { // 'tokenURI'
    const collectionMetadata = JSON.parse(offchainSchema) as MetadataType;
    return await fetchTokenImage(collectionMetadata, tokenId);
  }
  return '';
};
