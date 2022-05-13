import { MetadataType } from '../unique/types';
import { hex2a } from './decoder';
import { UpDataStructsCollection } from '@unique-nft/types/unique/types';

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

export const getTokenImage = async (collection: UpDataStructsCollection, tokenId: number): Promise<string> => {
  if (collection.schemaVersion.isImageURL) {
    return getTokenImageUrl(hex2a(collection.offchainSchema.toHex()), tokenId);
  } else {
    const collectionMetadata = JSON.parse(hex2a(collection.offchainSchema.toHex())) as MetadataType;
    return await fetchTokenImage(collectionMetadata, tokenId);
  }
};
