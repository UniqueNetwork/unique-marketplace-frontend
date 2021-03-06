import React, { useCallback, useState } from 'react';
import { Tabs } from '@unique-nft/ui-kit';
import { TokensTradesPage } from './TokensTrades';
import { useAccounts } from '../../hooks/useAccounts';

export const TradesPage = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const { selectedAccount } = useAccounts();

  const handleClick = useCallback((tabIndex: number) => {
    setActiveTab(tabIndex);
  }, [setActiveTab]);

  return (<>
    <Tabs
      activeIndex={activeTab}
      labels={['All tokens', 'My tokens']}
      onClick={handleClick}
      disabledIndexes={!selectedAccount ? [1] : []}
    />
    <TokensTradesPage currentTab={activeTab} />
  </>);
};
