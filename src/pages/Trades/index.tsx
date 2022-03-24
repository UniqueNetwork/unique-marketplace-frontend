import React, { useCallback, useState } from 'react';
import { Tabs } from '@unique-nft/ui-kit';
import { AllTokensTradesPage } from './AllTokensTrades';
import { MyTokensTradesPage } from './MyTokensTrades';

export const TradesPage = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleClick = useCallback((tabIndex: number) => {
    setActiveTab(tabIndex);
  }, [setActiveTab]);

  return (<>
    <Tabs
      activeIndex={activeTab}
      labels={['All tokens', 'My tokens']}
      onClick={handleClick}
    />
    <Tabs activeIndex={activeTab}>
      <AllTokensTradesPage />
      <MyTokensTradesPage />
    </Tabs>
  </>);
};
