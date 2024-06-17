export const IPFSGateway = 'https://ipfs.unique.network/ipfs/';

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
  if (!imagePath || imagePath === `${IPFSGateway}`) {
    return undefined;
  }

  const buildPath = (url: string) => {
    if (isValidHttpUrl(url)) {
      return url;
    }
    return `${IPFSGateway}${url}`;
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

export const isYouTubeLink = (url: string): boolean => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return pattern.test(url);
};

interface Categories {
  images: string[];
  audio: string[];
  video: string[];
  youtube: RegExp;
}

export const categorizeFile = (fileOrUrl: string): string => {
  const categories: Categories = {
    images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'],
    audio: ['mp3', 'wav', 'aac', 'ogg', 'flac'],
    video: ['mp4', 'avi', 'mkv', 'mov', 'mpeg'],
    youtube: /^https?:\/\/(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/.+/,
  };
  
  function getFileExtension(fileOrUrl: string): string {
    const urlParts: string[] = fileOrUrl.split('.');
    return urlParts[urlParts.length - 1].toLowerCase();
  }

  if (categories.youtube.test(fileOrUrl)) {
    return 'youtube';
  }

  const fileExtension: string = getFileExtension(fileOrUrl);

  for (const category in categories) {
    if (category !== 'youtube') {
      const categoryList = categories[category as keyof Categories];
      if (Array.isArray(categoryList) && categoryList.includes(fileExtension)) {
        return category;
      }
    }
}

  return 'unknown';
};
