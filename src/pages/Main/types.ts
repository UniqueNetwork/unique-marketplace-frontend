import { ApolloQueryResult } from '@apollo/client'

type BlockComponentProps<T> = {
  data?: T
  pageSize: number
  loading?: boolean
  onPageChange: (limit: number, offset: number) => Promise<ApolloQueryResult<T>>
}

export type { BlockComponentProps }
