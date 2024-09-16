import React, { createContext, useContext, useState, ReactNode } from 'react';

export enum BUNDLE_PERMISSIONS {
  UNLIMETED = 'UNLIMETED',
  COLLECTION_OWNER_OR_ADMIN = 'COLLECTION_OWNER_OR_ADMIN',
  RESTRICTED = 'RESTRICTED',
}

export enum SPONSOR_PERMISSIONS {
  NOT_SPONSORED = 'NOT_SPONSORED',
  OWNER = 'OWNER',
}

interface CollectionSettingsContextType {
  collectionSize: string;
  setCollectionSize: (size: string) => void;
  accountTokenOwnershipLimit: string;
  setaccountTokenOwnershipLimit: (limit: string) => void;
  tokenTransferPermission: boolean;
  setTokenTransferPermission: (permission: boolean) => void;
  bundlePermission: string;
  setBundlePermission: (permission: BUNDLE_PERMISSIONS) => void;
  collectionSponsoring: string;
  setCollectionSponsoring: (sponsor: SPONSOR_PERMISSIONS) => void;
}

export const UNLIMETED_CONST = '99999999999999901';

const CollectionSettingsContext = createContext<CollectionSettingsContextType | undefined>(undefined);

export const CollectionSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [collectionSize, setCollectionSize] = useState(UNLIMETED_CONST);
  const [accountTokenOwnershipLimit, setaccountTokenOwnershipLimit] = useState(UNLIMETED_CONST);
  const [tokenTransferPermission, setTokenTransferPermission] = useState(true);
  const [bundlePermission, setBundlePermission] = useState(BUNDLE_PERMISSIONS.UNLIMETED);
  const [collectionSponsoring, setCollectionSponsoring] = useState(SPONSOR_PERMISSIONS.NOT_SPONSORED);

  return (
    <CollectionSettingsContext.Provider
      value={{
        collectionSize,
        setCollectionSize,
        accountTokenOwnershipLimit,
        setaccountTokenOwnershipLimit,
        tokenTransferPermission,
        setTokenTransferPermission,
        bundlePermission,
        setBundlePermission,
        collectionSponsoring,
        setCollectionSponsoring,
      }}
    >
      {children}
    </CollectionSettingsContext.Provider>
  );
};

export const useCollectionSettings = () => {
  const context = useContext(CollectionSettingsContext);
  if (!context) {
    throw new Error('useCollectionSettings must be used within a CollectionSettingsProvider');
  }
  return context;
};
