const IPFSGateway = 'https://ipfs.uniquenetwork.dev/ipfs/';

type ImagePath = {
  ipfs: string;
  type: string;
};

const isImagePath = (value: any): value is ImagePath =>
  !!(value as ImagePath).ipfs;

const isValidHttpUrl = (checkUrl: string): boolean => {
  let url;

  try {
    url = new URL(checkUrl);
  } catch (_) {
    return false;
  }

  return ['http:', 'https:'].includes(url.protocol);
};

/* IPFS links can be like this:
 * 1) 'QmbuyQebXVQcZbaGmP4maWUqRiKYeAAyYZEiqL3rnev8i4'
 * 2) https://www.ipfs-server/QmbuyQebXVQcZbaGmP4maWUqRiKYeAAyYZEiqL3rnev8i4
 * 3) "{\"ipfs\":\"QmZCuWx72x1ukhehLsg1qNjKhVj3d1feJjadUPJbyYfmpY\",\"type\":\"image\"}"
 * */
export const getIpfsUriByImagePath = (
  imagePath: string | null | undefined
): string | undefined => {
  if (!imagePath || imagePath === `${IPFSGateway}/`) {
    return undefined;
  }

  const buildPath = (url: string) => {
    if (isValidHttpUrl(url)) {
      return url;
    }
    return `${IPFSGateway}/${url}`;
  };

  try {
    const deserializedImagePath: unknown = JSON.parse(imagePath);

    if (IPFSGateway && isImagePath(deserializedImagePath) && deserializedImagePath.ipfs) {
      return buildPath(deserializedImagePath.ipfs);
    }
  } catch {
    return buildPath(imagePath);
  }

  return undefined;
};
