import React from 'react';
import AccountDetail from './components/AccountDetail'
import LastTransfers from './components/LastTransfers'
import { useParams } from 'react-router-dom'

const AccountPage = () => {
 const { accountId } = useParams();

 if (!accountId) return null;

 return <div>
   <AccountDetail accountId={accountId} />
   <LastTransfers />
 </div>;
}

export default AccountPage;