import { gql, useQuery } from '@apollo/client'
import { AccountData, AccountVariables } from './types'
const accountQuery = gql`
  query getAccount($accountId: String!) {
    account_by_pk(account_id: $accountId) {
      account_id
      available_balance
      balances
      block_height
      free_balance
      is_staking
      locked_balance
      nonce
      timestamp
    }
  }
`

export const useGraphQlAccount = (accountId: string) => {
  const { loading: isAccountFetching, data: account } = useQuery<AccountData, AccountVariables>(
    accountQuery,
    {
      variables: { accountId },
      notifyOnNetworkStatusChange: true,
    }
  )

  return { account: account?.account_by_pk, isAccountFetching }
}

export { accountQuery }
