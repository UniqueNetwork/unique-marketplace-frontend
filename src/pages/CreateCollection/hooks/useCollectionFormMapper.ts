/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { CreateCollectionV2ArgsDto } from '@unique-nft/sdk';

import { CollectionForm } from '../types';
import { IPFSGateway } from 'utils/urlUtils';

export const useCollectionFormMapper = () => {
  const mapper = (form: Partial<CollectionForm>): CreateCollectionV2ArgsDto => {
    const {
      address,
      name,
      description,
      symbol,
      // tokenLimit,
      // ownerCanDestroy,
      // sponsorAddress,
      attributes,
      coverPictureIpfsCid,
      // nesting
    } = form;

    const coverPictureUrl = coverPictureIpfsCid ? `${IPFSGateway}${coverPictureIpfsCid}` : '';

    const request: CreateCollectionV2ArgsDto = {
      name: name || '',
      address: address || '',
      description: description || '',
      encodeOptions: {
        defaultPermission: {
          mutable: true,
          collectionAdmin: true,
          tokenOwner: true
        },
        overwriteTPPs: [
          {
            key: 'royalties',
            permission: {
              mutable: true,
              collectionAdmin: true,
              tokenOwner: false
            }
          }
        ]
      },
      symbol: symbol || '',
      tokenPrefix: symbol || '',
      cover_image: coverPictureUrl
        ? {
            url: coverPictureUrl
          }
        : undefined,
      potential_attributes: attributes
        ? attributes.map(({ name, values }) => ({
            trait_type: name || '',
            display_type: 'string',
            values
          }))
        : undefined,
      permissions: {
        nesting: {
          tokenOwner: true,
          collectionAdmin: false
        }
      }
    };
    return request;
  };

  return mapper;
};
