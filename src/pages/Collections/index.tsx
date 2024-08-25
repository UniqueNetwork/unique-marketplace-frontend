import React, { FCC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Select, Button } from 'components/UI';
import styled from 'styled-components/macro';
import NoItems from 'components/NoItems';
import { Secondary400 } from 'styles/colors';
import { CollectionCard } from 'components/CollectionCard/CollectionCard';
import { AdminPanelModal } from './Modals/AdminPanelModal';
import { AdminPanelModalType } from './Modals/types';
import { PagePaper } from 'components/PagePaper/PagePaper';
import CardSkeleton from 'components/Skeleton/CardSkeleton';
import SearchField from 'components/SearchField/SearchField';
import { useAccounts } from 'hooks/useAccounts';
import config from 'config';
import { useApi } from 'hooks/useApi';
import { useCollections } from 'hooks/useCollections';
import { useNavigate } from 'react-router-dom';
import { GQLCollection } from 'api/scanApi/types';
import { SelectOptionProps } from 'components/UI/types';

type TOption = {
  iconRight: {
    color: string
    name: string
    size: number
  }
  id: string
  title: string
  direction: string
  field: keyof GQLCollection
}

const sortingOptions: TOption[] = [
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

export const CollectionsPage: FCC = () => {
  const { currentChainId, settings, refetchSettings } = useApi();
  const { selectedAccount } = useAccounts();
  const [sortingValue, setSortingValue] = useState<TOption>(sortingOptions[0]);
  const [searchValue, setSearchValue] = useState<string>();
  const [modalType, setModalType] = useState(AdminPanelModalType.default);
  const [selectedCollection, setSelectedCollection] = useState<GQLCollection>();
  const { collections, isFetching, fetchCollections } = useCollections();
  const { isLoading: isAccountsLoading } = useAccounts();
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      void await fetchCollections(selectedAccount);
      setModalType(AdminPanelModalType.default);
    })();
  }, [isAccountsLoading, currentChainId, selectedAccount, settings, fetchCollections]);

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
    void await refetchSettings();
    void await fetchCollections(selectedAccount);
  }, []);

  const onCreateCollectionClick = useCallback(() => {
    navigate(`/${currentChainId}/create-collection`);
  }, [currentChainId]);

  const onViewOnScanClick = useCallback((collection: GQLCollection) => () => {
    const { scanUrl } = config.blockchains[currentChainId || ''] || {};
    if (!scanUrl) return;
    window.open(`${scanUrl}unique_collection/${collection.id}`, '_blank')?.focus();
  }, [currentChainId]);

  const filteredCollections = useMemo(() => {
    if (!collections) return [];
    const sortCollection = (collectionA: GQLCollection, collectionB: GQLCollection) => {
      if (!sortingValue) return 0;
      const order = sortingValue.direction === 'asc' ? 1 : -1;
      if (sortingValue.field === 'id') return Number(collectionA[sortingValue.field]) > Number(collectionB[sortingValue.field]) ? order : -order;
      return (collectionA[sortingValue.field] || '') > (collectionB[sortingValue.field] || '') ? order : -order;
    };

    const filterCollection = (collection: GQLCollection) => {
      if (!collection) return false;
      if (searchValue) {
        const searchString = searchValue.trim().toLocaleLowerCase();
        return collection.id.toString().includes(searchString) || collection.name?.toLocaleLowerCase().includes(searchString) || collection.tokenPrefix?.toLocaleLowerCase().includes(searchString);
      }
      return true;
    };

    return collections.filter(filterCollection).sort(sortCollection);
  }, [sortingValue, searchValue, collections]);

  const CreateCollectionButtonRef = useRef<HTMLDivElement>(null);

  return (<PagePaper>
    <MainContent>
      <ControlsWrapper>
        <SearchAndSortingWrapper>
          <SearchField
            placeholder='Search for collections'
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
          <Button role='primary' title={'Create collection'} onClick={onCreateCollectionClick}/>
        </ButtonsWrapper>
      </ControlsWrapper>
      <CollectionListWrapper>
        {!(isAccountsLoading || isFetching) && filteredCollections.length === 0 && <NoItems
          noItemsText='You don`t have any personal collections yet, but you can create one right now!'
        />}
        <CollectionListStyled >
          {(isAccountsLoading || isFetching) && <>
            {Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={`card-skeleton-${index}`} />)}
          </>}
          {!isAccountsLoading && !isFetching && filteredCollections?.map((collection) => <CollectionCard
            key={`collection-${collection.id}`}
            collection={collection}
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
  margin-top: calc(var(--prop-gap) * 0.5);

  > div:nth-of-type(2) {
    margin-top: calc(var(--prop-gap) * 2);
    margin-bottom: calc(var(--prop-gap) * 2);
  }
`;

const ControlsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 1110px) {
    flex-direction: column;
    gap: calc(var(--prop-gap) * 1.5);
  }
`;

const ButtonsWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--prop-gap) / 2);
  
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
    gap: calc(var(--prop-gap) / 2);
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
  flex: 1;
  .unique-input-text {
    min-width: 436px;
  }
  div {
    /* flex-grow: unset; */
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
    gap: var(--prop-gap);
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

  @media (max-width: 1600px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  @media (max-width: 1250px) {
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
