export type QueryParams = Record<string, string | number | (string | number)[]>;

export type Pagination = {
  page: number
  pageSize: number
}

export type Sortable = {
  sort?: string[]
}

export type PaginatedResponse<T> = {
  currentPage: number
  itemsPerPage: number
  itemsCount: number
  items: T[]
  totalItems: number
  totalPages: number
}

export type ResponseError = {
  status?: number
  message: string
  prettifiedMessage?: string
}
