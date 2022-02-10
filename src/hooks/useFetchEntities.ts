import { useCallback, useEffect, useState } from 'react';
import { AxiosResponse } from 'axios';
import { PaginatedResponse } from '../api/restApi/base/types';

export const useFetchEntities = <P, T>(props: Exclude<P, 'page'>, fetchFunc: (payload: P) => Promise<AxiosResponse<PaginatedResponse<T>>>) => {
  const [items, setItems] = useState<T[]>([]);
  const [count, setCount] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isFetchingError, setIsFetchingError] = useState<boolean>(false);

  const fetch = useCallback((payload: P) => {
    fetchFunc(payload).then((response) => {
      if (response.status === 200) {
        setItems(response.data.items);
        setCount(response.data.itemsCount);
        setIsFetching(false);
      } else {
        setIsFetchingError(true);
      }
    });
  }, []);

  useEffect(() => {
    fetch({ ...props, page: 1 });
  }, []);

  return {
    items,
    count,
    isFetching,
    isFetchingError,
    fetchMore: fetch
  };
};
