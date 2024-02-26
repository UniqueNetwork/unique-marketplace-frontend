/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { CreateCollectionBody } from '@unique-nft/sdk';

import { CollectionForm } from './types';
import { IPFSGateway } from 'utils/urlUtils';

export const mapCollectionForm = (form: CollectionForm): CreateCollectionBody => {
  const {
    address,
    name,
    description,
    symbol,
    tokenLimit,
    ownerCanDestroy,
    sponsorAddress,
    coverPictureIpfsCid,
    nesting
  } = form;

  const collectionBody: CreateCollectionBody = {
    name,
    address,
    description,
    permissions: {
      nesting
    },
    sponsorship: {
      isConfirmed: false,
      address: sponsorAddress
    },
    tokenPrefix: symbol,
    limits: {
      tokenLimit,
      ownerCanDestroy,
      transfersEnabled: true,
      ownerCanTransfer: true
    },
    schema: {
      coverPicture: {
        ipfsCid: coverPictureIpfsCid || ''
      },
      image: {
        urlTemplate: `${IPFSGateway}/{infix}`
      },
      schemaName: 'unique',
      schemaVersion: '1.0.0'
    }
  };

  if (form.attributes?.length) {
    collectionBody.schema!.attributesSchema = {};
    collectionBody.schema!.attributesSchemaVersion = '1.0.0';

    form.attributes.forEach((attr, index) => {
      collectionBody.schema!.attributesSchema![index] = {
        type: 'string',
        name: { _: attr.name } as any,
        optional: attr.optional.id === 'optional',
        isArray: attr.type.id === 'repeated'
      };

      if (attr.values?.length) {
        collectionBody.schema!.attributesSchema![index].enumValues = attr.values.reduce(
          (acc, val, index) => {
            return {
              ...acc,
              [index]: { _: val }
            };
          },
          {}
        );
      }
    });
  }

  return collectionBody;
};

export type ImagePath = {
  ipfs: string;
  type: string;
};

const isImagePath = (value: unknown): value is ImagePath =>
  Object.hasOwn(value as ImagePath, 'ipfs');

const isValidHttpUrl = (checkUrl: string): boolean => {
  let url;

  try {
    url = new URL(checkUrl);
  } catch (_) {
    return false;
  }

  return ['http:', 'https:'].includes(url.protocol);
};

export const getTokenIpfsUriByImagePath = (
  imagePath: string | null | undefined
): string | undefined => {
  if (!imagePath || imagePath === `${IPFSGateway}/`) {
    return undefined;
  }

  const buildPath = (url: string) => {
    if (isValidHttpUrl(url)) {
      return url;
    }
    return `${IPFSGateway}/${url}`;
  };

  try {
    const deserializedImagePath: unknown = JSON.parse(imagePath);

    if (IPFSGateway && isImagePath(deserializedImagePath) && deserializedImagePath.ipfs) {
      return buildPath(deserializedImagePath.ipfs);
    }
  } catch {
    return buildPath(imagePath);
  }

  return undefined;
};
