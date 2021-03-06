import { useEffect, useState } from 'react';

const useBackground = () => {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/background.jpeg');
        const imageBlob = await response.blob();
        const imageObjectURL = URL.createObjectURL(imageBlob);
        setImage(imageObjectURL);
      } catch (err) {
        console.log('Error during loading background image', err);
      }
    })();
  }, []);

  return image;
};

export default useBackground;
