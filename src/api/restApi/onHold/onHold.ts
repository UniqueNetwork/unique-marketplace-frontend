import { useCallback, useEffect, useState } from 'react';

import { get } from '../base';
import { serializeToQuery } from '../base/helper';
import { GetOnHoldRequestPayload, OnHold, OnHoldResponse, UseFetchOnHoldProps } from './types';
import { QueryParams, ResponseError } from '../base/types';

const endpoint = '/OnHold';

export const getOnHold = ({ owner, ...payload }: GetOnHoldRequestPayload) => get<OnHoldResponse>(`${endpoint}${owner ? '/' + owner : ''}` + serializeToQuery(payload as unknown as QueryParams));

export const useOnHold = (props: UseFetchOnHoldProps) => {
  const [onHoldItems, setOnHoldItems] = useState<OnHold[]>([]);
  const [onHoldCount, setOnHoldCount] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<ResponseError | undefined>();

  const fetch = useCallback((payload: GetOnHoldRequestPayload) => {
    setIsFetching(true);
    getOnHold(payload).then((response) => {
      if (response.status === 200) {
        setOnHoldItems(response.data.items);
        setOnHoldCount(response.data.itemsCount);
        setIsFetching(false);
      } else {
        setFetchingError({
          status: response.status,
          message: JSON.stringify(response.data)
        });
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
    fetchingError,
    fetchMore: fetch
  };
};
