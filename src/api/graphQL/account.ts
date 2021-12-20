import { gql } from '@apollo/client'
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

interface Variables {
  accountId: string
}
interface Data {
  account_by_pk: {
    account_id: string
    available_balance: string
    balances: string
    block_height: number
    free_balance: string
    locked_balance: string
    timestamp: number
    nonce: string
  }
}

export type { Variables, Data }
export { accountQuery }
