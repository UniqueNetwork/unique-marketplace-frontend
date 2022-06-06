import React, { FC, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { Button, InputText, Select, Text } from '@unique-nft/ui-kit';
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

type TOption = {
  iconRight: {
    color: string;
    name: string;
    size: number;
  };
  id: string;
  title: string;
}

const sortingOptions: TOption[] = [
  {
    iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
    id: 'asc(Price)',
    title: 'Date added'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
    id: 'desc(Price)',
    title: 'Date added'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
    id: 'asc(TokenId)',
    title: 'Token ID'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
    id: 'desc(TokenId)',
    title: 'Token ID'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-up', size: 16 },
    id: 'asc(CreationDate)',
    title: 'Listing date'
  },
  {
    iconRight: { color: Secondary400, name: 'arrow-down', size: 16 },
    id: 'desc(CreationDate)',
    title: 'Listing date'
  }
];

export const AdminPanelPage: FC = () => {
  const [sortingValue, setSortingValue] = useState<string>();
  const [searchValue, setSearchValue] = useState<string | number>();
  const [modalType, setModalType] = useState(AdminPanelModalType.default);
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection>();
  const { hasAdminPermission, getJWToken, isLoggingIn } = useAdminLoggingIn();
  const { collections, isFetching, fetch } = useAdminCollections();
  const navigate = useNavigate();
  const { push } = useNotification();

  useEffect(() => {
    if (!hasAdminPermission) {
      navigate('/');
    }
    void (async () => {
      const jwtoken = await getJWToken();
      if (!jwtoken) {
        push({ message: 'Unable to login, please try again!', severity: NotificationSeverity.error });
        navigate('/');
      }
      void await fetch();
    })();
  }, [hasAdminPermission]);

  const onSortingChange = useCallback((value: string) => {
    setSortingValue(value);
    // TODO: refetch collections
  }, []);

  const onSearch = useCallback(() => {
    // TODO: refetch collections
  }, [sortingValue, searchValue]);

  const onSearchStringChange = useCallback((value: string) => {
    setSearchValue(value);
  }, [setSearchValue]);

  const onSearchInputKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Enter') return;
    onSearch();
  }, [onSearch]);

  const onModalClose = useCallback(() => {
    setModalType(AdminPanelModalType.default);
  }, []);

  const onFinish = useCallback(async () => {
    setModalType(AdminPanelModalType.default);
    void await fetch();
  }, []);

  const onAddCollectionClick = useCallback(() => {
    setModalType(AdminPanelModalType.addCollection);
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

  return (<PagePaper>
    <MainContent>
      <ControlsWrapper>
        <SearchAndSortingWrapper>
          <SearchWrapper>
            <InputTextStyled
              iconLeft={{ name: 'magnify', size: 16 }}
              onChange={onSearchStringChange}
              onKeyDown={onSearchInputKeyDown}
              placeholder='Collection / token'
              value={searchValue?.toString()}
            />
          </SearchWrapper>
          <SortSelectWrapper>
            <Select
              onChange={onSortingChange}
              options={sortingOptions}
              value={sortingValue}
            />
          </SortSelectWrapper>
        </SearchAndSortingWrapper>
        <ButtonsWrapper>
          <Button title={'Create new via wallet'} onClick={onAddCollectionClick}/>
          <Button role={'primary'} title={'Add to the marketplace'} onClick={onAddCollectionClick}/>
        </ButtonsWrapper>
      </ControlsWrapper>
      <CollectionListWrapper>
        {isFetching}
        {collections.length === 0 && <NoItems />}
        <CollectionListStyled >
          {collections?.map((collection) => <CollectionCard collection={collection}
            onManageSponsorshipClick={onManageSponsorshipClick(collection)}
            onRemoveSponsorshipClick={onRemoveSponsorshipClick(collection)}
            onRemoveCollectionClick={onRemoveCollectionClick(collection)}
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

const SearchWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  margin-right: 16px;
  button {
    margin-left: 8px;
  }

  @media (max-width: 768px) {
    width: 100%;
    .unique-input-text {
      flex-grow: 1;
    }
  }

  @media (max-width: 320px) {
    margin-right: 0;
    .unique-button {
      display: none;
    }
  }
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
`;

const InputTextStyled = styled(InputText)`
  width: 100%;
  max-width: 610px;
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

const AuthorizationMessageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
