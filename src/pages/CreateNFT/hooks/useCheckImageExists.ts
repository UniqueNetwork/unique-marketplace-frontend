import { useEffect, useState } from 'react';

export const useCheckImageExists = (imageSrc?: string | null) => {
  const [imgSrc, setImgSrc] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    if (imageSrc) {
      const image = new Image();

      image.onload = () => {
        if (isMounted) {
          setImgSrc(imageSrc);
          setLoading(false);
        }
      };

      image.onerror = () => {
        setLoading(false);
      };

      image.src = imageSrc;
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [imageSrc]);

  return {
    imgSrc,
    loading,
  };
};
