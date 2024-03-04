import { CollectionProperty, PropertyKeyPermission } from '@unique-nft/sdk';
import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { useCallback, useState } from 'react';

export const useCollectionSetTokenPropertyPermissions = () => {
  const { api } = useApi();
  const { selectedAccount } = useAccounts();
  const [submitWaitResultError, setSubmitWaitResultError] = useState<string>();
  const [isLoadingSubmitResult, setIsLoadingSubmitResult] = useState(false);

  const submitWaitResult = useCallback(async ({ collectionId, propertyPermissions }: {
    collectionId: number,
    propertyPermissions: PropertyKeyPermission[]
  }) => {
    if (!api || !selectedAccount) return;
    setIsLoadingSubmitResult(true);
    const response = await api?.collection?.setTokenPropertyPermissions(collectionId, propertyPermissions, { account: selectedAccount });
    setIsLoadingSubmitResult(false);
    return response;
  }, [api, selectedAccount]);

  return {
    submitWaitResult,
    isLoadingSubmitResult,
    submitWaitResultError
  };
};
