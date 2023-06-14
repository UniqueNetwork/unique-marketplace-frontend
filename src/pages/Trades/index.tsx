import React, { useState } from 'react';
import { Tabs } from 'components/UI';
import { TokensTradesPage } from './TokensTrades';
import { useAccounts } from '../../hooks/useAccounts';

const testid = 'trades-page';

export const TradesPage = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const { selectedAccount } = useAccounts();

  return (<>
    <Tabs
      testid={`${testid}-tabs`}
      activeIndex={activeTab}
      labels={['All tokens', 'Sell tokens']}
      onClick={setActiveTab}
      disabledIndexes={!selectedAccount ? [1] : []}
    />
    <TokensTradesPage currentTab={activeTab} testid={`${testid}-${activeTab ? 'sellTokens' : 'allTokens'}`} />
  </>);
};
