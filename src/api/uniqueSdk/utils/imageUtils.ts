import { MetadataType } from '../../chainApi/unique/types';
import { CollectionProperties } from '@unique-nft/sdk/tokens';

export const getTokenImageUrl = (urlString: string | undefined, tokenId: number): string => {
  if (!urlString) return '';
  if (urlString?.indexOf('{id}') !== -1) {
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

export const getTokenImage = async (collectionPropeties: CollectionProperties, tokenId: number): Promise<string> => {
  const { schemaVersion, offchainSchema } = collectionPropeties;
  if (schemaVersion === 'ImageURL') {
    return Promise.resolve(getTokenImageUrl(offchainSchema, tokenId));
  }
  // else if (schemaVersion === 'tokenURI') { // TODO: 'tokenURI' ???
  //   const collectionMetadata = JSON.parse(offchainSchema) as MetadataType;
  //   return await fetchTokenImage(collectionMetadata, tokenId);
  // }
  return '';
};
