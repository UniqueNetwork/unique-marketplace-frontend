import React from 'react';
import AccountDetail from './components/AccountDetail'
import LastTransfers from './components/LastTransfers'

const AccountPage = () => {
 const mokAccountId = '5Fuv2d5vedMcFU2ppZkx3MHjMWdPP8rVECf67K63sTcufCN1';

  return <div>
   <AccountDetail accountId={mokAccountId} />
   <LastTransfers accountId={mokAccountId} />
  </div>;
}

export default AccountPage;