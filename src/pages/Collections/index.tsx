import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { SelectOptionProps } from '@unique-nft/ui-kit';
import { Select, Button } from 'components/UI';
import styled from 'styled-components/macro';
import NoItems from 'components/NoItems';
import { Secondary400 } from 'styles/colors';
import { CollectionCard } from 'components/CollectionCard/CollectionCard';
import { AdminPanelModal } from './Modals/AdminPanelModal';
import { AdminPanelModalType } from './Modals/types';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { useCollections } from 'api/restApi/collections/collection';
import CardSkeleton from 'components/Skeleton/CardSkeleton';
import SearchField from 'components/SearchField/SearchField';
import { useAccounts } from 'hooks/useAccounts';
import { MyCollection } from 'api/restApi/collections/types';
import config from 'config';
import { useApi } from 'hooks/useApi';

type TOption = {
  iconRight: {
    color: string
    name: string
    size: number
  }
  id: string
  title: string
  direction: string
  field: keyof MyCollection
}

const sortingOptions: TOption[] = [
  // {
  //   iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
  //   id: 'asc(Date)',
  //   direction: 'asc',
  //   field: 'updatedAt',
  //   title: 'Date added'
  // },
  // {
  //   iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
  //   id: 'desc(Price)',
  //   direction: 'desc',
  //   field: 'updatedAt',
  //   title: 'Date added'
  // },
  {
    iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
    id: 'asc(collectionId)',
    direction: 'asc',
    field: 'id',
    title: 'Collection ID'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
    id: 'desc(collectionId)',
    direction: 'desc',
    field: 'id',
    title: 'Collection ID'
  }
];

export const CollectionsPage: FC = () => {
  const { selectedAccount } = useAccounts();
  const [sortingValue, setSortingValue] = useState<TOption>(sortingOptions[0]);
  const [searchValue, setSearchValue] = useState<string>();
  const [modalType, setModalType] = useState(AdminPanelModalType.default);
  const [selectedCollection, setSelectedCollection] = useState<MyCollection>();
  const { collections, isFetching, fetchCollections } = useCollections();
  const { isLoading: isAccountsLoading } = useAccounts();
  const { currentChainId } = useApi();

  useEffect(() => {
    void (async () => {
      void await fetchCollections(selectedAccount);
      setModalType(AdminPanelModalType.default);
    })();
  }, [isAccountsLoading, currentChainId, fetchCollections]);

  const onSortingChange = useCallback((value: SelectOptionProps) => {
    setSortingValue(value as TOption);
  }, []);

  const onSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const onModalClose = useCallback(() => {
    setModalType(AdminPanelModalType.default);
  }, []);

  const onFinish = useCallback(async () => {
    setModalType(AdminPanelModalType.default);
    void await fetchCollections(selectedAccount);
  }, []);

  const onAddCollectionClick = useCallback(() => {
    setModalType(AdminPanelModalType.addCollection);
  }, []);

  const onCreateCollectionViaWalletClick = useCallback(() => {
    const { walletUrl } = config.blockchains[currentChainId || ''] || {};
    window.open(walletUrl, '_blank')?.focus();
  }, [currentChainId]);

  const onManageSponsorshipClick = useCallback((collection: MyCollection) => () => {
    setModalType(AdminPanelModalType.acceptSponsorship);
    setSelectedCollection(collection);
  }, []);

  const onRemoveSponsorshipClick = useCallback((collection: MyCollection) => () => {
    setModalType(AdminPanelModalType.rejectSponsorship);
    setSelectedCollection(collection);
  }, []);

  const onRemoveCollectionClick = useCallback((collection: MyCollection) => () => {
    setModalType(AdminPanelModalType.removeCollection);
    setSelectedCollection(collection);
  }, []);

  const onManageTokensClick = useCallback((collection: MyCollection) => () => {
    setModalType(AdminPanelModalType.selectNFTs);
    setSelectedCollection(collection);
  }, []);

  const onViewOnScanClick = useCallback((collection: MyCollection) => () => {
    const { scanUrl } = config.blockchains[currentChainId || ''] || {};
    if (!scanUrl) return;
    window.open(`${scanUrl}collections/${collection.id}`, '_blank')?.focus();
  }, [currentChainId]);

  const filteredCollections = useMemo(() => {
    if (!collections) return [];
    const sortCollection = (collectionA: MyCollection, collectionB: MyCollection) => {
      if (!sortingValue) return 0;
      const order = sortingValue.direction === 'asc' ? 1 : -1;
      if (sortingValue.field === 'id') return Number(collectionA[sortingValue.field]) > Number(collectionB[sortingValue.field]) ? order : -order;
      return (collectionA[sortingValue.field] || '') > (collectionB[sortingValue.field] || '') ? order : -order;
    };

    const filterCollection = (collection: MyCollection) => {
      if (!collection) return false;
      if (searchValue) {
        const searchString = searchValue.trim().toLocaleLowerCase();
        return collection.id.toString().includes(searchString) || collection.name?.toLocaleLowerCase().includes(searchString) || collection.tokenPrefix?.toLocaleLowerCase().includes(searchString);
      }
      return true;
    };

    return collections.filter(filterCollection).sort(sortCollection);
  }, [sortingValue, searchValue, collections]);

  return (<PagePaper>
    <MainContent>
      <ControlsWrapper>
        <SearchAndSortingWrapper>
          <SearchField
            placeholder='Search'
            searchValue={searchValue}
            onSearchStringChange={onSearch}
            hideButton
          />
          <SortSelectWrapper>
            <Select
              onChange={onSortingChange}
              options={sortingOptions}
              value={sortingValue?.id}
              optionKey='id'
            />
          </SortSelectWrapper>
        </SearchAndSortingWrapper>
        <ButtonsWrapper>
          <Button title={'Create new via wallet'} onClick={onCreateCollectionViaWalletClick}/>
          <Button
            role={'primary'}
            title={'Add to the marketplace'}
            onClick={onAddCollectionClick}
          />
        </ButtonsWrapper>
      </ControlsWrapper>
      <CollectionListWrapper>
        {!(isAccountsLoading || isFetching) && filteredCollections.length === 0 && <NoItems />}
        <CollectionListStyled >
          {(isAccountsLoading || isFetching) && <>
            {Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={`card-skeleton-${index}`} />)}
          </>}
          {filteredCollections?.map((collection) => <CollectionCard
            key={`collection-${collection.id}`}
            collection={collection}
            onManageSponsorshipClick={onManageSponsorshipClick(collection)}
            onRemoveSponsorshipClick={onRemoveSponsorshipClick(collection)}
            onManageTokensClick={onManageTokensClick(collection)}
            onRemoveCollectionClick={onRemoveCollectionClick(collection)}
            onViewOnScanClick={onViewOnScanClick(collection)}
          />)}
        </CollectionListStyled>
      </CollectionListWrapper>
    </MainContent>
    <AdminPanelModal
      collection={selectedCollection}
      modalType={modalType}
      onClose={onModalClose}
      onFinish={onFinish}
    />
  </PagePaper>);
};

const MainContent = styled.div`
  position: relative;
  flex: 1;
  margin-top: calc(var(--gap) * 0.5);

  > div:nth-of-type(2) {
    margin-top: calc(var(--gap) * 2);
    margin-bottom: calc(var(--gap) * 2);
  }
`;

const ControlsWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  @media (max-width: 1279px) {
    flex-direction: column;
    gap: calc(var(--gap) * 1.5);
  }
`;

const ButtonsWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  
  @media (max-width: 1279px) {
    .unique-button.size-middle {
      padding: 8px 29px;
    }
    button:last-of-type {
      width: 228px;
    }
  }

  @media (max-width: 567px) {
    flex-direction: column;
    gap: calc(var(--gap) / 2);
    button:last-of-type {
      width: 100%;
    }
  }
`;

const SortSelectWrapper = styled.div`
  .unique-select svg {
    z-index: 0;
  }
`;

const SearchAndSortingWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  .unique-input-text {
    min-width: 436px;
  }
  div {
    flex-grow: unset;
  }
  
  @media (max-width: 1279px) {
    justify-content: flex-start;
    .unique-input-text {
      min-width: 448px;
    }
    .select-wrapper {
      width: 268px;
    }
  }
  
  @media (max-width: 1023px) {
    .select-wrapper {
      width: 256px;
    }
    .unique-input-text {
      width: 442px;
    }
  }

  @media (max-width: 767px) {
    flex-direction: column;
    gap: var(--gap);
    .unique-input-text {
      width: 100%;
    }
    .select-wrapper {
      width: 212px;
    }
  }

  @media (max-width: 567px) {
    .unique-input-text {
      min-width: 100%;
    }
    .unique-select, .select-wrapper {
      width: 100%;
    }
  }
`;

const CollectionListWrapper = styled.div`
  position: relative;
`;

const CollectionListStyled = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 32px;

  @media (max-width: 1919px) {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }

  @media (max-width: 1439px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  @media (max-width: 1023px) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 567px) {
    display: flex;
    flex-direction: column;
  }
`;
