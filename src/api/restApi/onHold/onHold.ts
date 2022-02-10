import { get } from '../base';
import { defaultParams } from '../base/axios';
import { serializeToQuery } from '../base/helper';
import { GetOnHoldRequestPayload, OnHold, OnHoldResponse, UseFetchOnHoldProps } from './types';
import { useCallback, useEffect, useState } from 'react';
import { QueryParams } from '../base/types';

const endpoint = '/OnHold';

export const getOnHold = ({ owner, ...payload }: GetOnHoldRequestPayload) => get<OnHoldResponse>(`${endpoint}${owner ? '/' + owner : ''}` + serializeToQuery(payload as unknown as QueryParams));

export const useFetchOnHold = (props: UseFetchOnHoldProps) => {
  const [onHoldItems, setOnHoldItems] = useState<OnHold[]>([]);
  const [onHoldCount, setOnHoldCount] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isFetchingError, setIsFetchingError] = useState<boolean>(false);

  const fetch = useCallback((payload: GetOnHoldRequestPayload) => {
    getOnHold(payload).then((response) => {
      if (response.status === 200) {
        setOnHoldItems(response.data.items);
        setOnHoldCount(response.data.itemsCount);
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
    onHoldItems,
    onHoldCount,
    isFetching,
    isFetchingError,
    fetchMore: fetch
  };
};
