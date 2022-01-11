export interface GqlApi {
  collections: any
}

// TODO: here goes all the methods from BlockExplorer that we are using
const gqlApi = {
  collections: {}, // inside should be main methods, but that return gql queries
  // ex. getCollections(where) -> { data, fetchMore, isLoading }
  tokens: {},
}

export default gqlApi;
