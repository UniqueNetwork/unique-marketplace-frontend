import { IPFSGateway } from 'utils/urlUtils';

export const getCoverURLFromCollection = (collectionCover: string | undefined) => {
  if (!collectionCover) {
    return undefined;
  }

  if (collectionCover.startsWith('http')) {
    return collectionCover;
  }

  try {
    const cover = JSON.parse(collectionCover).ipfs as string;

    if (cover.startsWith('http')) {
      return cover;
    }

    return `${IPFSGateway}/${cover}`;
  } catch (e) {
    //
  }

  return `${IPFSGateway}/${collectionCover}`;
};
