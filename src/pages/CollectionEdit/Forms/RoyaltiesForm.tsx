import { useCallback, useEffect, useState } from 'react';
import { Heading } from '@unique-nft/ui-kit';

import { Button, Text } from 'components/UI';
import { RoyaltiesFormData } from '../types';
import { NumberInput } from 'components/NumberInput/NumberInput';
import { ButtonsRow, FormRow, FormWrapper } from './FormComponents';
import styled from 'styled-components';
import { SelectInput } from 'components/SelectInput/SelectInput';
import { useAccounts } from 'hooks/useAccounts';
import { MarketAccount } from 'account/types';
import AccountCard from 'components/Account/Account';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { validateAddress } from 'api/chainApi/utils/addressUtils';
import { useApi } from 'hooks/useApi';

interface RoyaltiesFormProps {
  initialFormData?: Partial<RoyaltiesFormData>;
  onSubmit(formData: Partial<RoyaltiesFormData>): void;
}

export const RoyaltiesForm = ({ initialFormData, onSubmit }: RoyaltiesFormProps) => {
  const { prefixes } = useApi();
  const { accounts } = useAccounts();
  const [isValidRecipientAddress, setIsValidRecipientAddress] = useState(true);
  const [percentage, setPercentage] = useState<string>();
  const [recipient, setRecipient] = useState<string | MarketAccount>();
  const deviceSize = useDeviceSize();

  useEffect(() => {
    setPercentage(initialFormData?.value);
    setRecipient(initialFormData?.address || '');
  }, [initialFormData]);

  const onChangePercentage = useCallback((value: string) => {
    if (Number(value) > 99) return;
    setPercentage(value);
  }, [setPercentage]);

  const onSubmitForm = useCallback(() => {
    if (!recipient) return;
    onSubmit({
      address: (recipient as MarketAccount)?.address || recipient as string,
      value: percentage || '0'
    });
  }, [onSubmit, percentage, recipient]);

  const [filteredAccounts, setFilteredAccounts] = useState(accounts);

  const onFilter = useCallback((input: string) => {
    setFilteredAccounts(accounts.filter((account) => {
      return account.address.toLowerCase().includes(input.toLowerCase()) || account.name?.toLowerCase().includes(input.toLowerCase());
    }));
  }, [accounts]);

  const onChangeAddress = useCallback((value: string | MarketAccount) => {
    setRecipient(value);

    if (typeof value === 'string') {
      const isValid = value ? validateAddress(value, prefixes) : true;
      setIsValidRecipientAddress(isValid);
      onFilter(value);
    } else {
      setFilteredAccounts(accounts);
      setIsValidRecipientAddress(true);
    }
  }, [accounts, onFilter, prefixes]);

  const isValid = !!percentage && !!recipient && isValidRecipientAddress;
  const isChanged = percentage !== (initialFormData?.value || '0') || (recipient !== initialFormData?.address);

  return <FormWrapper>
    <Heading size='2' >Royalties</Heading>
    <FormRow>
      <RecipientSelectWrapper >
        <Text color='secondary-500'>Royalty recipient address</Text>
        <SelectInput<MarketAccount>
          options={(filteredAccounts as unknown as MarketAccount[])}
          value={recipient}
          onChange={onChangeAddress}
          renderOption={(option) => <AddressOptionWrapper>
            <AccountCard accountName={option.name || ''}
              accountAddress={option.address}
              canCopy
              isShort={deviceSize < DeviceSize.md}
            />
          </AddressOptionWrapper>}
        />
      </RecipientSelectWrapper>
      {!isValidRecipientAddress && <ErrorWrapper size={'s'} color={'var(--color-coral-500)'} >Address is not valid</ErrorWrapper>}
    </FormRow>
    <FormRow>
      <NumberInput
        label='Royalty percentage'
        additionalText='Maximum royalty - 99%'
        placeholder='%'
        value={percentage}
        onChange={onChangePercentage}
        decimals={2}
      />
    </FormRow>
    <ButtonsRow>
      <Button title='Save changes' onClick={onSubmitForm} disabled={!isValid || !isChanged} />
    </ButtonsRow>
  </FormWrapper>;
};

const RecipientSelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 2);
  .unique-input-text {
    width: 100%;
  }
  &>.unique-text {
    font-weight: 600;
  }
`;

const AddressOptionWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 2);
`;

const ErrorWrapper = styled(Text)`
  margin-top: calc(var(--gap) / 2);
  display: block;
`;
