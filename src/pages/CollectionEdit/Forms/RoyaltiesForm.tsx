import { useCallback, useEffect, useMemo, useState } from 'react';

import { Heading,Button, Text } from 'components/UI';
import { RoyaltiesFormData, Royalty } from '../types';
import { NumberInput } from 'components/NumberInput/NumberInput';
import { ButtonsRow, FormRow, FormWrapper } from './FormComponents';
import styled from 'styled-components';
import { SelectInput } from 'components/SelectInput/SelectInput';
import { useAccounts } from 'hooks/useAccounts';
import { Account } from 'account/types';
import AccountCard from 'components/Account/Account';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { validateAddress } from 'api/chainApi/utils/addressUtils';
import { useApi } from 'hooks/useApi';
import { IconButton } from 'components/IconButton/IconButton';
import { useAccountsFilter } from 'hooks/useAccountsFilter';

interface RoyaltiesFormProps {
  initialFormData: RoyaltiesFormData;
  onSubmit(formData: Partial<RoyaltiesFormData>): void;
}

export const RoyaltiesForm = ({ initialFormData, onSubmit }: RoyaltiesFormProps) => {
  const [royalties, setRoyalties] = useState<Royalty[]>([]);
  const [validMap, setValidMap] = useState<boolean[]>([]);

  useEffect(() => {
    setRoyalties(initialFormData.royalties);
    setValidMap(initialFormData.royalties.map(() => true));
  }, [initialFormData]);

  const onAddRoyalty = useCallback(() => {
    setRoyalties([...royalties, {
      value: '0',
      address: ''
    }]);
    setValidMap([...validMap, false]);
  }, [royalties, validMap]);

  const onChangeRoyalty = useCallback((index: number) => (value: Royalty, isValid: boolean) => {
    setRoyalties([...royalties.slice(0, index), value, ...royalties.slice(index + 1)]);
    setValidMap([...validMap.slice(0, index), isValid, ...validMap.slice(index + 1)]);
  }, [royalties, validMap]);

  const onRemoveRoyalty = useCallback((index: number) => () => {
    royalties.splice(index, 1);
    setRoyalties([...royalties]);
  }, [royalties]);

  const onSubmitForm = useCallback(() => {
    onSubmit({
      royalties
    });
  }, [onSubmit, royalties]);

  const totalRoyalty = royalties.reduce((acc, { value }) => Number(acc) + Number(value), 0);
  const isChanged = useMemo(() => {
    if (royalties.length !== initialFormData.royalties.length) return true;

    return initialFormData.royalties.some(({ address, value }, index) => royalties[index].address !== address ||
      royalties[index].value !== value);
  }, [initialFormData.royalties, royalties]);

  const isValid = useMemo(() => {
    return !validMap.some((value) => !value);
  }, [validMap]);

  return <FormWrapper>
    <Heading size='2' >Royalties</Heading>
    {royalties.map((royalty, index) => <RoyaltyComplexComponent
      key={`$royalty_${index}`}
      initialValue={royalty}
      onChange={onChangeRoyalty(index)}
      onRemove={onRemoveRoyalty(index)}
    />)}
    <TotalWrapper>
      <Text color='secondary-500'>Total royalty: {totalRoyalty}%</Text>
      <Text color='grey-500' size='s' weight='light'>Maximum royalty - 99%</Text>
    </TotalWrapper>
    <ButtonsRow>
      <Button title='Save changes' onClick={onSubmitForm} disabled={!isValid || !isChanged || totalRoyalty > 99} />
      <Button title='Add royalty' onClick={onAddRoyalty} />
    </ButtonsRow>
  </FormWrapper>;
};

type RoyaltyComplexComponentProps = {
  initialValue: Royalty
  onChange(value: Royalty, isValid: boolean): void
  onRemove(): void
};

const RoyaltyComplexComponent = ({ initialValue, onChange, onRemove }: RoyaltyComplexComponentProps) => {
  const deviceSize = useDeviceSize();
  const { prefixes } = useApi();
  const { accounts } = useAccounts();
  const [isValidRecipientAddress, setIsValidRecipientAddress] = useState(true);
  const [percentage, setPercentage] = useState<string>(initialValue.value || '');
  const [recipient, setRecipient] = useState<string | Account | undefined>(initialValue.address);

  const { filteredAccounts, onFilter, onReset } = useAccountsFilter();

  useEffect(() => {
    setPercentage(initialValue?.value);
    setRecipient(initialValue?.address || '');
  }, [initialValue]);

  const onChangeAddress = useCallback((value: string | Account) => {
    setRecipient(value);
    if (typeof value === 'string') {
      const isValid = value ? validateAddress(value, prefixes) : true;
      setIsValidRecipientAddress(isValid);
      onFilter(value);
      onChange({ value: percentage, address: value }, !!value && isValid);
    } else {
      onReset();
      setIsValidRecipientAddress(true);
      onChange({ value: percentage, address: value.address }, !!value);
    }
  }, [accounts, onFilter, onReset, prefixes, percentage, onChange]);

  const onChangePercentage = useCallback((value: string) => {
    if (Number(value) > 99) return;
    setPercentage(value);
    const isValid = !!recipient && (typeof recipient === 'string' ? validateAddress(recipient, prefixes) : true);
    onChange({
      value,
      address: typeof value === 'string' ? recipient as string : (recipient as Account).address
    }, isValid);
  }, [recipient, prefixes, onChange]);

  return <RoyaltyWrapper>
    <FormRow>
      <RecipientSelectWrapper >
        <Text color='secondary-500'>Royalty recipient address</Text>
        <SelectInput<Account>
          options={(filteredAccounts as unknown as Account[])}
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
      <RecipientSelectWrapper >
        <Text color='secondary-500'>Royalty percentage</Text>
        <NumberInput
          placeholder='%'
          value={percentage}
          onChange={onChangePercentage}
          decimals={2}
        />
      </RecipientSelectWrapper>
    </FormRow>
    <IconButton name='trash' onClick={onRemove} size={24} />
  </RoyaltyWrapper>;
};

const RoyaltyWrapper = styled.div`
  display: flex;
  gap: 32px;
  &>div:first-child {
    flex: 1;
  }
  &>button {
    align-self: flex-start;
    margin-top: 40px;
  }
`;
const TotalWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  flex-direction: column;
  width: 100%;
`;

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
  &>div:first-child{
    flex-grow: 0;
    min-width: 24px;
  }
`;

const ErrorWrapper = styled(Text)`
  margin-top: calc(var(--gap) / 2);
  display: block;
`;
