import React, { FC, useCallback, useState } from 'react';
import { Button, Heading, Modal, Text, Upload } from '@unique-nft/ui-kit';
import { KeyringPair } from '@polkadot/keyring/types';
import styled from 'styled-components';

import { TAccountModalProps } from './types';
import { PasswordInput } from 'components/PasswordInput/PasswordInput';
import { convertToU8a, keyringFromFile } from '../../../utils/jsonUtils';
import { useApi } from '../../../hooks/useApi';
import keyring from '@polkadot/ui-keyring';
import { WarningBlock } from 'components/WarningBlock/WarningBlock';

export const ImportViaJSONAccountModal: FC<TAccountModalProps> = ({ isVisible, onFinish, testid }) => {
  const { rawRpcApi } = useApi();
  const [pair, setPair] = useState<KeyringPair | null>(null);
  const [password, setPassword] = useState<string>('');
  const [passwordIncorrect, setPasswordIncorrect] = useState<boolean>(false);

  const onUploadChange = useCallback((data: { url: string; file: Blob } | null) => {
    if (!data) return;
    const reader = new FileReader();
    reader.onload = ({ target }: ProgressEvent<FileReader>): void => {
      if (target && target.result && rawRpcApi) {
        console.log(target.result);
        const data = convertToU8a(target.result as ArrayBuffer);

        setPair(keyringFromFile(data, rawRpcApi.genesisHash.toHex()));
      }
    };

    reader.readAsArrayBuffer(data.file);
  }, [setPair, rawRpcApi]);

  const onRestoreClick = useCallback(() => {
    if (!pair || !password) return;
    try {
      keyring.addPair(pair, password);
    } catch (error) {
      console.error(error);
      setPasswordIncorrect(true);
      return;
    }
    onFinish();
  }, [pair, password, onFinish]);

  return (<Modal isVisible={isVisible} isClosable={true} onClose={onFinish}>
    <Content>
      <Heading size='2'>{'Add an account via backup JSON file'}</Heading>
    </Content>
    <InputWrapper>
      <TitleWrapper>
        <Text size={'m'}>Upload</Text>
        <Text size={'s'} color={'grey-500'}>Click to select or drop the file here</Text>
      </TitleWrapper>
      <Upload
        // @ts-ignore
        testid={`${testid}-upload-button`}
        onChange={onUploadChange}
        type={'square'}
        accept={'.json'}
      />
    </InputWrapper>
    <InputWrapper>
      <TitleWrapper>
        <Text size={'m'}>Password</Text>
        <Text size={'s'} color={'grey-500'}>The password that was previously used to encrypt this account</Text>
      </TitleWrapper>
      <PasswordInput
        testid={`${testid}-password`}
        onChange={setPassword}
        value={password}
      />
      {passwordIncorrect && <Text size={'s'} color={'coral-500'}>Password incorrect</Text>}
    </InputWrapper>
    <WarningBlock>
      Consider storing your account in a signer such as a browser extension, hardware device, QR-capable phone wallet (non-connected) or desktop application for optimal account security. Future versions of the web-only interface will drop support for non-external accounts, much like the IPFS version.
    </WarningBlock>
    <ButtonWrapper>
      <Button
        // @ts-ignore
        testid={`${testid}-restore-button`}
        disabled={!password || !pair}
        onClick={onRestoreClick}
        role='primary'
        title='Restore'
      />
    </ButtonWrapper>

  </Modal>);
};

const Content = styled.div`
  && h2 {
    margin-bottom: 0;
  }
`;

const InputWrapper = styled.div`
  padding: var(--gap) 0;
  display: flex;
  flex-direction: column;
  row-gap: var(--gap);
  
  .unique-upload {
    width: 100%;
    .upload.square, .preview.square {
      width: 100%;
    }
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) / 4);
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: calc(var(--gap) * 2);
`;
