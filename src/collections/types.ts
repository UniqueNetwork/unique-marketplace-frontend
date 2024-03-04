import { CollectionPermissionsDto, TokenProperty, AttributeSchemaDto } from '@unique-nft/sdk';

export type GQLCollection = {
  attributesSchema: Record<number, AttributeSchemaDto>
  owner: string
  cover: string
  id: number
  name: string
  tokenPrefix: string
  properties: TokenProperty[]
  permissions: CollectionPermissionsDto
}
