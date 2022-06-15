import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Select, SelectOptionProps } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import NoItems from '../../components/NoItems';
import { Secondary400 } from '../../styles/colors';
import { NFTCollection } from '../../api/chainApi/unique/types';
import { CollectionCard } from '../../components/CollectionCard/CollectionCard';
import { AdminPanelModal } from './Modals/AdminPanelModal';
import { AdminPanelModalType } from './Modals/types';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification';
import { NotificationSeverity } from '../../notification/NotificationContext';
import { useAdminLoggingIn } from '../../api/restApi/admin/login';
import { useAdminCollections } from '../../api/restApi/admin/collection';
import CardSkeleton from '../../components/Skeleton/CardSkeleton';
import SearchField from '../../components/SearchField/SearchField';
import { useAccounts } from '../../hooks/useAccounts';
import { CollectionData } from '../../api/restApi/admin/types';
import config from '../../config';

type TOption = {
  iconRight: {
    color: string
    name: string
    size: number
  }
  id: string
  title: string
  direction: string
  field: keyof CollectionData
}

const sortingOptions: TOption[] = [
  {
    iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
    id: 'asc(Date)',
    direction: 'asc',
    field: 'updatedAt',
    title: 'Date added'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
    id: 'desc(Price)',
    direction: 'desc',
    field: 'updatedAt',
    title: 'Date added'
  },
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

export const AdminPanelPage: FC = () => {
  const [sortingValue, setSortingValue] = useState<TOption>(sortingOptions[0]);
  const [searchValue, setSearchValue] = useState<string>();
  const [modalType, setModalType] = useState(AdminPanelModalType.default);
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection>();
  const { hasAdminPermission, getJWToken } = useAdminLoggingIn();
  const { collections, isFetching, fetchCollections } = useAdminCollections();
  const { isLoading: isAccountsLoading } = useAccounts();
  const navigate = useNavigate();
  const { push } = useNotification();

  useEffect(() => {
    if (isAccountsLoading) return;
    if (!hasAdminPermission) {
      navigate('/');
    }
    void (async () => {
      const jwtoken = await getJWToken();
      if (!jwtoken) {
        push({ message: 'Unable to login, please try again!', severity: NotificationSeverity.error });
        navigate('/');
      }
      void await fetchCollections();
    })();
  }, [hasAdminPermission, isAccountsLoading]);

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
    void await fetchCollections();
  }, []);

  const onAddCollectionClick = useCallback(() => {
    setModalType(AdminPanelModalType.addCollection);
  }, []);

  const onCreateCollectionViaWalletClick = useCallback(() => {
    if (!config.walletUrl) return;
    window.open(config.walletUrl, '_blank')?.focus();
  }, []);

  const onManageSponsorshipClick = useCallback((collection: NFTCollection) => () => {
    setModalType(AdminPanelModalType.acceptSponsorship);
    setSelectedCollection(collection);
  }, []);

  const onRemoveSponsorshipClick = useCallback((collection: NFTCollection) => () => {
    setModalType(AdminPanelModalType.rejectSponsorship);
    setSelectedCollection(collection);
  }, []);

  const onRemoveCollectionClick = useCallback((collection: NFTCollection) => () => {
    setModalType(AdminPanelModalType.removeCollection);
    setSelectedCollection(collection);
  }, []);

  const onManageTokensClick = useCallback((collection: NFTCollection) => () => {
    setModalType(AdminPanelModalType.selectNFTs);
    setSelectedCollection(collection);
  }, []);

  const onViewOnScanClick = useCallback((collection: NFTCollection) => () => {
    if (!config.scanUrl) return;
    window.open(`${config.scanUrl}collections/${collection.id}`, '_blank')?.focus();
  }, []);

  const filteredCollections = useMemo(() => {
    if (!collections) return [];
    const sortCollection = (collectionA: CollectionData, collectionB: CollectionData) => {
      if (!sortingValue) return 0;
      const order = sortingValue.direction === 'asc' ? 1 : -1;
      if (sortingValue.field === 'id') return Number(collectionA[sortingValue.field]) > Number(collectionB[sortingValue.field]) ? order : -order;
      return (collectionA[sortingValue.field] || '') > (collectionB[sortingValue.field] || '') ? order : -order;
    };

    const filterCollection = (collection: CollectionData) => {
      if (collection.status === 'Disabled') return false;
      if (searchValue) {
        const searchString = searchValue.trim().toLocaleLowerCase();
        return Number(collection.id) === Number(searchString) || collection.name?.toLocaleLowerCase().includes(searchString) || collection.tokenPrefix?.toLocaleLowerCase().includes(searchString);
      }
      return true;
    };

    return collections.filter(filterCollection).sort(sortCollection);
  }, [sortingValue, searchValue, collections]);

  return (<PagePaper>
    <MainContent>
      <ControlsWrapper>
        <SearchAndSortingWrapper>
          <SearchField placeholder='Search' onSearch={onSearch} hideButton />
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
          <Button role={'primary'} title={'Add to the marketplace'} onClick={onAddCollectionClick}/>
        </ButtonsWrapper>
      </ControlsWrapper>
      <CollectionListWrapper>
        {!(isAccountsLoading || isFetching) && filteredCollections.length === 0 && <NoItems />}
        <CollectionListStyled >
          {isAccountsLoading && isFetching && <>
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

  > div:nth-of-type(2) {
    margin-top: var(--gap);
    margin-bottom: calc(var(--gap) * 2);
  }

  @media (max-width: 1024px) {
    padding-left: 0;
  }
`;

const ControlsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
`;

const SortSelectWrapper = styled.div`
  @media (max-width: 1024px) {
    display: none;
  }

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
`;

const CollectionListWrapper = styled.div`
  position: relative;
`;

const CollectionListStyled = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 32px;

  @media (max-width: 1919px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  @media (max-width: 1439px) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (max-width: 1023px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 567px) {
    display: flex;
    flex-direction: column;
  }
`;
