import { ApolloQueryResult } from '@apollo/client'

type BlockComponentProps<T> = {
  data?: T
  count: number
  pageSize: number
  loading: boolean
  onPageChange: (limit: number, offset: number) => Promise<any>
}

export type { BlockComponentProps }
