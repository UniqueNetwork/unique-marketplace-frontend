import { useForm, FormProvider } from 'react-hook-form';

import { CollectionForm } from './types';
import { CreateCollection } from './CreateCollection';
import { useAccounts } from 'hooks/useAccounts';

export const CreateCollectionForm = () => {
  const { selectedAccount } = useAccounts();
  const collectionForm = useForm<CollectionForm>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      symbol: '',
      description: '',
      address: selectedAccount?.address,
      nesting: {
        tokenOwner: false
      }
    }
  });

  return (
    <FormProvider {...collectionForm}>
      <CreateCollection />
    </FormProvider>
  );
};

export const CreateCollectionPage = CreateCollectionForm;
