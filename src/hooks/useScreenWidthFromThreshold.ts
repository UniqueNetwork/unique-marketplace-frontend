import { useEffect, useState } from 'react';

// determines whether the screen width is less than the threshold
export const useScreenWidthFromThreshold = (threshold: number): { lessThanThreshold: boolean } => {
  const media = window.matchMedia(`(max-width: ${threshold}px)`);
  const [lessThanThreshold, setLessThanThreshold] = useState(media.matches);

  useEffect(() => {
    const listener = () => {
      const media = window.matchMedia(`(max-width: ${threshold}px)`);
      setLessThanThreshold(media.matches);
    };

    window.addEventListener('resize', listener);
    window.addEventListener('fullscreenchange', listener);

    return () => {
      window.removeEventListener('resize', listener);
      window.removeEventListener('fullscreenchange', listener);
    };
  }, [threshold]);

  return { lessThanThreshold };
};
