import { useCallback, useEffect } from 'react';
import { debounce } from '../utils/helpers';
import useDeviceSize, { DeviceSize } from './useDeviceSize';

export const useInfinityScroll = (onBottomReached: (...args: any[]) => void, onlyOnMobileScreen = true) => {
  const deviceSize = useDeviceSize();
  const debouncedScrollHandler = useCallback(() => {
    return debounce(function (...args: any) {
      const e = args[0];
      if ((e?.target as Document).scrollingElement) {
        const { scrollHeight, clientHeight, scrollTop } = e.target.scrollingElement;
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        if ((clientHeight + scrollTop === scrollHeight)) onBottomReached();
      }
    }, 300);
  }, [onBottomReached]);

  useEffect(() => {
    const callback = debouncedScrollHandler();
    if ((onlyOnMobileScreen && deviceSize !== DeviceSize.lg) || !onlyOnMobileScreen) {
      document.addEventListener('scroll', callback);
    }
    return () => {
      document.removeEventListener('scroll', callback);
    };
  }, [debouncedScrollHandler, deviceSize, onlyOnMobileScreen]);
};
