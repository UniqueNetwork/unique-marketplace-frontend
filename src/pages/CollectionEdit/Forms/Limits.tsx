import { useEffect, useMemo, useState } from 'react';

import { Heading, Alert, TooltipWrapper, Button, InputText, Text, useNotifications, ButtonGroup, Toggle } from 'components/UI';

import { SettingsSavingProps } from './types';
import { Form, FormBody, SettingsRow } from 'pages/CreateCollection/components/FormComponents';
import { FormRow } from './FormComponents';
import { maxTokenLimit } from 'pages/CreateNFT/constants';
import { FeeMessage } from 'components';
import { StatusTransactionModal } from './StatusTransactionModal';
import { ConfirmUpdateCollectionModal } from './ConfirmUpdateCollectionModal';
import { useCollectionSetLimits } from './hooks/useCollectionSetLimits';
import { useAccounts } from 'hooks/useAccounts';

export const Limits = ({ collectionInfo, onComplete }: SettingsSavingProps) => {
  const [isVisibleConfirmModal, setVisibleConfirmModal] = useState(false);
  const { selectedAccount } = useAccounts();
  const {
    feeFormatted,
    getFee,
    feeError,
    feeLoading,
    submitWaitResult,
    isLoadingSubmitResult
  } = useCollectionSetLimits();
  const { info } = useNotifications();

  const { limits, collectionId } = collectionInfo || {};

  const [tokenLimit, setTokenLimit] = useState<string | undefined>(
    limits?.tokenLimit?.toString()
  );
  const [ownerCanTransfer, setOwnerCanTransfer] = useState<boolean>(
    limits?.ownerCanTransfer || false
  );
  const [transfersEnabled, setTransfersEnabled] = useState<boolean>(
    limits?.transfersEnabled || false
  );
  const [accountTokenOwnershipLimit, setAccountTokenOwnershipLimit] = useState<string | undefined>(
    limits?.accountTokenOwnershipLimit?.toString()
  );

  const isChanged = useMemo(() => {
    return (
      (Number(tokenLimit) || maxTokenLimit) !== (limits?.tokenLimit || maxTokenLimit)
    );
  }, [tokenLimit, limits]);

  const isValid = useMemo(() => {
    if (!tokenLimit && !limits?.tokenLimit) {
      return true;
    }
    return limits?.tokenLimit
      ? Number(tokenLimit) <= limits.tokenLimit
      : Number(tokenLimit) <= maxTokenLimit;
  }, [tokenLimit, limits?.tokenLimit]);

  useEffect(() => {
    if (!isValid || !isChanged || !collectionId || !selectedAccount?.address) {
      return;
    }
    void getFee({
      payload: {
        collectionId,
        address: selectedAccount?.address,
        limits: {
          tokenLimit: Number(tokenLimit),
          ownerCanTransfer,
          transfersEnabled,
          accountTokenOwnershipLimit: Number(accountTokenOwnershipLimit)
        }
      }
    });
  }, [collectionId, tokenLimit, getFee, isValid, isChanged, selectedAccount?.address]);

  const handleSubmit = async () => {
    if (!collectionId || !selectedAccount) {
      return;
    }

    setVisibleConfirmModal(false);

    try {
      await submitWaitResult(
        {
          payload: {
            collectionId,
            address: selectedAccount.address,
            limits: {
              tokenLimit: Number(tokenLimit),

            }
          }
        }
      );
      await onComplete?.();
      info('Limits set successfully');
    } catch (e: any) {
      setVisibleConfirmModal(false);
    }
  };

  return (
    <>
      <FormBody>
        <Form>
          <FormRow>
            <Heading size='4'>Token limit</Heading>
            <Text appearance='block'>
              Collection size&nbsp;—&nbsp;mandatory for listing a&nbsp;collection
              on&nbsp;a&nbsp;marketplace.
            </Text>
            <Text appearance='block'>
              Unlimited by&nbsp;default. This value can be&nbsp;changed many times over
              but with the&nbsp;following caveats: each successive value must
              be&nbsp;smaller than the&nbsp;previous one and it&nbsp;can never
              be&nbsp;reset back to&nbsp;&lsquo;unlimited&lsquo;.
            </Text>
          </FormRow>
          <SettingsRow>
            <InputText
              label='Numbers of tokens'
              placeholder='Unlimited'
              id='limit'
              role='number'
              value={tokenLimit}
              error={!isValid}
              statusText={
                !isValid
                  ? `The number of tokens must between 0 and ${
                      limits?.tokenLimit || maxTokenLimit
                    }`
                  : ''
              }
              onChange={(value) => {
                const parsed = Number(value);
                if (!parsed) {
                  !value && setTokenLimit(value);
                } else {
                  setTokenLimit(parsed > maxTokenLimit ? tokenLimit : parsed.toString());
                }
              }}
            />
          </SettingsRow>
          <SettingsRow>
            <Toggle
              on={transfersEnabled}
              label={
                <>
                  Trasfers enabled
                </>
              }
              onChange={setTransfersEnabled}
            />
          </SettingsRow>
          <SettingsRow>
            <Toggle
              on={ownerCanTransfer}
              label={
                <>
                  Owner can transfer
                </>
              }
              onChange={setOwnerCanTransfer}
            />
          </SettingsRow>
          <SettingsRow>
            <InputText
              label='Ownership limit per account'
              placeholder='Unlimited'
              id='limit'
              role='number'
              value={accountTokenOwnershipLimit}
              error={!isValid}
              statusText={
                !isValid
                  ? `The number of tokens must between 0 and ${
                      limits?.accountTokenOwnershipLimit || maxTokenLimit
                    }`
                  : ''
              }
              onChange={(value) => {
                const parsed = Number(value);
                if (!parsed) {
                  !value && setAccountTokenOwnershipLimit(value);
                } else {
                  setAccountTokenOwnershipLimit(parsed > maxTokenLimit ? tokenLimit : parsed.toString());
                }
              }}
            />
          </SettingsRow>
          <SettingsRow>
            {isValid && isChanged
? (
  <FeeMessage fee={feeFormatted} isFeeLoading={feeLoading} testid='fee' />
            )
: (
  <Alert type='warning'>
    A fee will be calculated after changing the&nbsp;token limit
  </Alert>
            )}
          </SettingsRow>
          <ButtonGroup $fill align='space-between'>
            <TooltipWrapper
              message={
                !isValid
                  ? 'Incorrect token limit value'
                  : !isChanged
                  ? 'Nothing changed'
                  : ''
              }
            >
              <Button
                title='Save changes'
                disabled={!isChanged || !isValid}
                onClick={() => {
                  setVisibleConfirmModal(true);
                }}
              />
            </TooltipWrapper>
          </ButtonGroup>
        </Form>
      </FormBody>

      <StatusTransactionModal
        isVisible={isLoadingSubmitResult}
        description='Updating limits'
      />

      <ConfirmUpdateCollectionModal
        title='Updating limits'
        isVisible={isVisibleConfirmModal}
        isLoading={feeLoading}
        fee={feeFormatted}
        onConfirm={handleSubmit}
        onClose={() => setVisibleConfirmModal(false)}
      />
    </>
  );
};
function useCollectionContext(): { collectionSettings: any; } {
  throw new Error('Function not implemented.');
}
