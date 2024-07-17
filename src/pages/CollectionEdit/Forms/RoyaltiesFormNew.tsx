import { useCallback, useEffect, useMemo, useState } from 'react';

import { Heading, Button, Text, TooltipWrapper, Icon } from 'components/UI';
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
import { Checkbox } from 'components/UI/Checkbox/Checkbox2';

interface RoyaltiesFormProps {
  initialFormData: Royalty[];
  withSaveButton: boolean;
  hasDifferentRoyalties?: boolean;
  hasDuplicateAddresses?: boolean;
  onSubmit(formData: Partial<RoyaltiesFormData>): void;
}

export const RoyaltiesFormNew = ({
  initialFormData,
  withSaveButton,
  hasDifferentRoyalties,
  hasDuplicateAddresses,
  onSubmit
}: RoyaltiesFormProps) => {
  const [royalties, setRoyalties] = useState<Royalty[]>([]);
  const [validMap, setValidMap] = useState<boolean[]>([]);
  const { prefixes } = useApi();
  const { selectedAccount } = useAccounts();

  useEffect(() => {
    setRoyalties(initialFormData);
    setValidMap(initialFormData.map(() => true));
  }, [initialFormData]);

  const onAddRoyalty = useCallback(() => {
    setRoyalties([
      ...royalties,
      {
        value: '0',
        address: ''
      }
    ]);
    setValidMap([...validMap, false]);
  }, [royalties, validMap]);

  const onChangeRoyalty = useCallback(
    (index: number) => (value: Royalty, isValid: boolean) => {
      let newRoyalties = [
        ...royalties.slice(0, index),
        value,
        ...royalties.slice(index + 1)
      ];
      setRoyalties(newRoyalties);
      setValidMap([
        ...validMap.slice(0, index),
        isValid,
        ...validMap.slice(index + 1)
      ]);

      if (withSaveButton) return;
      newRoyalties = newRoyalties.filter(
        ({ address, value }) => validateAddress(address, prefixes) && value
      );
      if (JSON.stringify(initialFormData) === JSON.stringify(newRoyalties))
        return;

      onSubmit({
        royalties: newRoyalties
      });
    },
    [royalties, validMap]
  );

  const onRemoveRoyalty = useCallback(
    (index: number) => () => {
      royalties.splice(index, 1);
      setRoyalties([...royalties]);
    },
    [royalties]
  );

  const onSubmitForm = useCallback(() => {
    onSubmit({
      royalties
    });
  }, [onSubmit, royalties]);

  const totalRoyalty = royalties.reduce(
    (acc, { value }) => Number(acc) + Number(value),
    0
  );
  const isChanged = useMemo(() => {
    if (royalties.length !== initialFormData.length) return true;

    return initialFormData.some(
      ({ address, value }, index) =>
        royalties[index].address !== address || royalties[index].value !== value
    );
  }, [initialFormData, royalties]);

  const isValid = useMemo(() => {
    return !validMap.some((value) => !value);
  }, [validMap]);

  const [isWithoutRoyalties, setIsWithoutRoyalties] = useState(true);

  //only on init
  useEffect(() => {
    if (initialFormData.length > 0) {
      setIsWithoutRoyalties(false);
      return;
    }

    if (!isWithoutRoyalties && initialFormData.length === 0) {
      const defaultRoyalties = [{ address: selectedAccount?.address || '', value: '5' }];
      setRoyalties(defaultRoyalties);
      setValidMap(defaultRoyalties.map(() => true));
      onSubmit({
        royalties: defaultRoyalties
      });
    }
  }, [isWithoutRoyalties, initialFormData]);

  return (
    <FormWrapper>
      <TitleWrap>
        <Text size='l' color='--color-secondary-500'>
          Choose your option
        </Text>
      </TitleWrap>
      <Text size='m' color='grey-500' weight='light'>
        Royalty % will be applied to all the NFTs you are minting.
      </Text>
      <br />
      <Text size='m' color='grey-500' weight='light'>
        Keep in mind that setting a high royalty percentage might discourage
        buyers from purchasing your NFTs.
      </Text>
      <OptionsWrapper>
        <Checkbox
          checked={isWithoutRoyalties}
          label={'No royalty (default) '}
          size={'m'}
          onChange={() => {
            setRoyalties([]);
            setValidMap([].map(() => true));
            onSubmit({
              royalties: [],
            });
            setIsWithoutRoyalties(!isWithoutRoyalties);
          }}
          testid={''}
          isRadio={true}
        />
        <Checkbox
          checked={!isWithoutRoyalties}
          label={'Set royalty'}
          size={'m'}
          onChange={() => setIsWithoutRoyalties(!isWithoutRoyalties)}
          testid={''}
          isRadio={true}
        />
      </OptionsWrapper>
      {!isWithoutRoyalties && (
        <>
          {!withSaveButton && hasDifferentRoyalties && (
            <TooltipWrapper
              message={
                "Some of the tokens you've selected already possess varying royalties values. You can either select a different set of tokens or modify the royalty value for the current selection."
              }
            >
              <Icon size={24} name='warning' color='var(--color-primary-500)' />
            </TooltipWrapper>
          )}
          {royalties.map((royalty, index) => (
            <RoyaltyComplexComponent
              key={`$royalty_${index}`}
              initialValue={royalty}
              onChange={onChangeRoyalty(index)}
              onRemove={onRemoveRoyalty(index)}
              index={index}
            />
          ))}

          {hasDuplicateAddresses && (
            <ErrorWrapper size={'s'} color={'var(--color-coral-500)'}>
              Royalties have duplicate addresses
            </ErrorWrapper>
          )}
          <ButtonsRow>
            <Button title='Add recipient' onClick={onAddRoyalty} />
          </ButtonsRow>
          <TotalWrapper>
            <TotalText color='secondary-500'>
              Total royalty: {totalRoyalty}%
            </TotalText>
            <Text
              color={totalRoyalty > 99 ? 'var(--color-coral-500)' : 'grey-500'}
              size='s'
              weight='light'
            >
              Max total royalty: 99%
            </Text>
          </TotalWrapper>
        </>
      )}
    </FormWrapper>
  );
};

type RoyaltyComplexComponentProps = {
  initialValue: Royalty;
  index: number;
  onChange(value: Royalty, isValid: boolean): void;
  onRemove(): void;
};

const RoyaltyComplexComponent = ({
  initialValue,
  index,
  onChange,
  onRemove
}: RoyaltyComplexComponentProps) => {
  const deviceSize = useDeviceSize();
  const { prefixes } = useApi();
  const { accounts } = useAccounts();
  const [isValidRecipientAddress, setIsValidRecipientAddress] = useState(true);
  const [percentage, setPercentage] = useState<string>(
    initialValue.value || ''
  );
  const [recipient, setRecipient] = useState<string | Account | undefined>(
    initialValue.address
  );

  const { filteredAccounts, onFilter, onReset } = useAccountsFilter();

  useEffect(() => {
    setPercentage(initialValue?.value);
    setRecipient(initialValue?.address || '');
  }, [initialValue]);

  const onChangeAddress = useCallback(
    (value: string | Account) => {
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
    },
    [accounts, onFilter, onReset, prefixes, percentage, onChange]
  );

  const onChangePercentage = useCallback(
    (value: string) => {
      if (Number(value) > 99) return;
      setPercentage(value || '0');
      const isValid =
        !!recipient &&
        (typeof recipient === 'string'
          ? validateAddress(recipient, prefixes)
          : true);
      onChange(
        {
          value: value || '0',
          address:
            typeof value === 'string'
              ? (recipient as string)
              : (recipient as Account).address
        },
        isValid
      );
    },
    [recipient, prefixes, onChange]
  );

  return (
    <RoyaltyWrapper>
      <FormRowWithoutPadding>
        <RecipientSelectWrapper>
          <Label size='m' weight='light' color='secondary-500'>
            Royalty recipient address
          </Label>
          <SelectInput<Account>
            options={filteredAccounts as unknown as Account[]}
            value={recipient}
            onChange={onChangeAddress}
            renderOption={(option) => (
              <AddressOptionWrapper>
                <AccountCard
                  accountName={option.name || ''}
                  accountAddress={option.address}
                  canCopy
                  isShort={deviceSize < DeviceSize.md}
                />
              </AddressOptionWrapper>
            )}
          />
        </RecipientSelectWrapper>
        {!isValidRecipientAddress && (
          <ErrorWrapper size={'s'} color={'var(--color-coral-500)'}>
            Address is not valid
          </ErrorWrapper>
        )}
      </FormRowWithoutPadding>
      <FormRow>
        <RecipientSelectWrapper>
          <Label size='m' weight='light' color='secondary-500'>
            Royalty percentage
          </Label>
          <NumberInput
            placeholder='Royalty %'
            value={percentage}
            onChange={onChangePercentage}
            decimals={2}
          />
        </RecipientSelectWrapper>
      </FormRow>
      <IconButton name='trash' onClick={onRemove} size={24} />
    </RoyaltyWrapper>
  );
};

const RoyaltyWrapper = styled.div`
  margin-top: calc(var(--prop-gap) * 0.5);
  display: flex;
  gap: 16px;
  & > div:first-child {
    flex: 1;
  }
  & > button {
    align-self: flex-start;
    margin-top: 47px;
  }
`;
const TotalWrapper = styled.div`
  display: flex;
  gap: 2px;
  margin-top: 55px;
  flex-direction: column;
  width: 100%;
`;

const TotalText = styled(Text)`
  font-size: 22px;
  line-height: 24px;
`;

const RecipientSelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--prop-gap);
  .unique-input-text {
    width: 100%;
  }
  & > .unique-text {
    font-weight: 600;
  }
`;

const AddressOptionWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--prop-gap) / 2);
  & > div:first-child {
    flex-grow: 0;
    min-width: 24px;
  }
`;

const ErrorWrapper = styled(Text)`
  margin-top: calc(var(--prop-gap) / 2);
  display: block;
`;

const TitleWrap = styled.div`
  margin-bottom: 4px;
`;

const OptionsWrapper = styled.div`
  width: 200px;
  margin-top: 32px;
  margin-bottom: calc(var(--prop-gap) * 2);
  display: flex;
  flex-direction: column;
  gap: 16px;

  label {
    color: var(--color-grey-600);
    font-size: 14px;
  }
`;

const Label = styled(Text)`
  font-weight: 500 !important;
`;

const FormRowWithoutPadding = styled(FormRow)``;
