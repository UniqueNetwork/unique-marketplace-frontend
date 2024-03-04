import { memo, useEffect } from 'react';

import { useFeeContext } from '../../context';
import { useNotifications } from 'components/UI';
import { FeeMessage } from 'components';

const FeeInformationTransactionContainer = () => {
  const { feeFormatted, feeLoading, feeError } = useFeeContext();

  const { error } = useNotifications();

  useEffect(() => {
    if (!feeError) {
      return;
    }
    error(feeError);
  }, [feeError]);

  return (
    <FeeMessage fee={feeFormatted || '0'} isFeeLoading={feeLoading} testid={'fee'} />
  );
};

export const FeeInformationTransaction = memo(FeeInformationTransactionContainer);
