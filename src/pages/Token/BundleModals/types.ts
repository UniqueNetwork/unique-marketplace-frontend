export enum BundleModalType {
    default = 'Not started', // initial state
    unnest = 'Unnest',
    nestedTransfer = 'NestedTransfer'
}

export type TUnnest = {
  accountAddress: string
}
