import { Address } from '@unique-nft/utils/address';
import { FC, Fragment, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { Avatar } from 'components';

import { useAccounts } from 'hooks/useAccounts';
import { useApi } from 'hooks/useApi';
import { Suggest, SuggestListProps } from 'components/UI/Suggest';
import { Button, Tag, Text } from 'components/UI';
import { useCollections } from 'hooks/useCollections';
import { getTokenIpfsUriByImagePath } from 'pages/CreateCollection/helpers';
import { SuggestOption } from './SuggestOption';
import { TokenTypeEnum } from 'pages/MyTokens/types';
import { GQLCollection } from 'api/scanApi/types';

export interface CollectionItem {
  id: number;
  title: string;
  description: string | undefined;
  img: string | undefined;
  tokensLimit?: number;
  tokensCount: number;
  mode: 'NFT' | 'ReFungible' | 'Fungible';
}

type CollectionSuggestProps = {
  collection?: GQLCollection;
  onChange(collection: GQLCollection | undefined): void;
};

export const CollectionSuggest: FC<CollectionSuggestProps> = ({
  collection,
  onChange
}) => {
  const [params] = useSearchParams();
  const collectionId = Number(params.get('collectionId') || 0);
  const { state: locationState } = useLocation();
  const { selectedAccount } = useAccounts();
  const presetCollection = locationState as GQLCollection;

  useEffect(() => {
    if (!presetCollection) {
      return;
    }
    onChange(presetCollection);
  }, [onChange, presetCollection, collectionId]);

  const { collections, isFetching, fetchCollections } = useCollections();

  useEffect(() => {
    void fetchCollections(selectedAccount);
  }, [fetchCollections, selectedAccount]);

  useEffect(() => {
    if (collectionId) {
      onChange(collections.find(({ id }) => collectionId === id));
    }
  }, [collections, collectionId]);

  const collectionsOptions: CollectionItem[] = useMemo(() => {
    const presetCollectionExists =
      collections.findIndex(
        ({ id }) => id === presetCollection?.id
      ) !== -1;
    return [
      ...(collections
        // filter NFT collections only until RFT minting is implemented
        // .filter((collection) => collection.mode === TokenTypeEnum.NFT)
        .map<CollectionItem>((collection) => ({
          id: collection.id,
          title: collection.name,
          description: collection.description,
          img: getTokenIpfsUriByImagePath(collection.cover),
          tokensCount: collection.tokensCount || 0,
          tokensLimit: collection.tokenLimit,
          mode: collection.mode
        })) ?? []),
      ...(presetCollection?.id && !presetCollectionExists
        ? [
            {
              id: presetCollection.id,
              title: presetCollection.name,
              description: presetCollection.description,
              img: getTokenIpfsUriByImagePath(presetCollection.cover),
              tokensCount: 0,
              mode: presetCollection.mode || TokenTypeEnum.NFT
            }
          ]
        : [])
    ].sort(({ id: idA }, { id: idB }) => (idA > idB ? -1 : 1));
  }, [collections, presetCollection]);

  const collectionOption = useMemo(() => {
    if (!collection) {
      return undefined;
    }
    return {
      id: collection.id,
      title: collection.name,
      description: collection.description,
      img: getTokenIpfsUriByImagePath(collection.cover),
      tokensCount: 0,
      mode: collection.mode || TokenTypeEnum.NFT
    };
  }, [collection]);

  return (
    <CollectionSuggestWrapper>
      <Suggest<CollectionItem>
        isManaged
        isClearable={false}
        components={{
          SuggestItem: CollectionSuggestion,
          SuggestList: CollectionsSuggestionList
        }}
        suggestions={collectionsOptions}
        isLoading={isFetching}
        value={collectionOption}
        getActiveSuggestOption={(option: CollectionItem) => {
          return option.id === collection?.id;
        }}
        getSuggestionValue={({ title }: CollectionItem) => title}
        onChange={(value) => {
          onChange(
            value
              ? collections.find(({ id }) => id === value?.id)
              : undefined
          );
        }}
        onSuggestionsFetchRequested={(value) =>
          collectionsOptions.filter(
            ({ id, title }) =>
              title.toLowerCase().includes(value.toLowerCase()) ||
              id.toString().includes(value)
          )
        }
      />
    </CollectionSuggestWrapper>
  );
};

export const CollectionSuggestWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: calc(var(--prop-gap) * 2);
  align-items: center;
  & > .unique-text {
    margin-bottom: 0;
  }
  & .unique-suggestion-wrapper {
    flex: 1;
    width: 100%;
    .unique-input-text.size-middle {
      width: 100%;
    }
  }
`;

const CollectionsSuggestionList: FC<SuggestListProps<CollectionItem>> = ({
  suggestions,
  children
}) => {
  const { currentChainId } = useApi();
  const navigate = useNavigate();
  const onCreateCollectionClick = () => {
    navigate(`/${currentChainId}/create-collection/`, {
      state: {
        returnToCreateToken: true
      }
    });
  };

  return (
    <>
      <CreateCollectionOption
        role='ghost'
        title={<Text color='primary-500'>Create collection</Text>}
        iconLeft={{ name: 'plus', size: 16, color: 'var(--color-primary-500)' }}
        onClick={onCreateCollectionClick}
      />
      {suggestions.map((suggest, idx) => (
        <Fragment key={idx}>{children(suggest, idx === suggestions.length - 1)}</Fragment>
      ))}
    </>
  );
};

const CreateCollectionOption = styled(Button)`
  padding-left: calc(var(--prop-gap) / 2) !important;
`;

const defaultOptions = {
  skip: false,
  pagination: {
    page: 0,
    limit: 300
  }
};

const CollectionSuggestion: FC<{
  suggestion: CollectionItem;
  isActive?: boolean;
}> = ({ suggestion, isActive }) => {
  return (
    <SuggestOption
      className={classNames('suggestion-item', {
        isActive
      })}
    >
      <Avatar size={24} type='circle' src={suggestion.img || undefined} />
      <span className='suggestion-item__title'>
        {suggestion.title} [id {suggestion.id}]
      </span>
      {suggestion.mode === 'ReFungible' && <Tag label='FRACTIONAL' type='info' />}
    </SuggestOption>
  );
};
