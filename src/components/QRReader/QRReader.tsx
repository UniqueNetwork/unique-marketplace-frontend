import React, { FC, useCallback } from 'react';
import styled from 'styled-components';
import { decodeAddress } from '@polkadot/util-crypto';
import { QrReader } from 'react-qr-reader';
import Result from '@zxing/library/esm/core/Result';
import { AdditionalCoral500 } from '../../styles/colors';

export interface ScannedResult {
  content: string
  genesisHash: string
  isAddress: boolean
  name?: string
}

interface QRReaderProps {
  isEthereum?: boolean
  onScan(scanned: ScannedResult): void
}

const defaultDelay = 150;
const ADDRESS_PREFIX = 'substrate';
const SEED_PREFIX = 'secret';

export const QRReader: FC<QRReaderProps> = ({ isEthereum, onScan }) => {
  const _onScan = useCallback((data: Result | null | undefined) => {
    if (!data) return;

    const text = data.getText();
    let prefix: string, content: string, genesisHash: string, name: string[];

    if (!isEthereum) {
      [prefix, content, genesisHash, ...name] = text.split(':');
    } else {
      [prefix, content, ...name] = text.split(':');
      genesisHash = '';
      content = content.substring(0, 42);
    }

    const expectedPrefix = (isEthereum ? 'ethereum' : ADDRESS_PREFIX);
    const isValidPrefix = (prefix === expectedPrefix) || (prefix === SEED_PREFIX);

    if (!isValidPrefix) throw new Error(`Invalid prefix received, expected '${expectedPrefix} or ${SEED_PREFIX}' , found '${prefix}'`);

    const isAddress = prefix === expectedPrefix;

    if (isAddress && !isEthereum) {
      decodeAddress(content);
    }

    onScan({ content, genesisHash, isAddress, name: name?.length ? name.join(':') : undefined });
  }, [isEthereum, onScan]);

  return (
    <QRReaderWrapper>
      <QrReader
        scanDelay={defaultDelay}
        onResult={_onScan}
        constraints={{
         facingMode: 'environment'
       }}
      />
    </QRReaderWrapper>
  );
};

const QRReaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: calc(var(--gap) / 2);
  section {
    width: 362px;
    display: flex;
    justify-content: center;
    align-items: center;
    @media (max-width: 567px) {
      width: 100%;
    }
  }
  div {
    height: 362px;
    padding-top: 0 !important;
    video {
      // height: unset !important;
    }
    @media (max-width: 567px) {
      height: 248px !important;
      width: 248px !important;
    }
    &:after {
      position: absolute;
      content: '';
      border: 5px solid var(--color-coral-400);
      box-sizing: border-box;
      width: 282px;
      height: 282px;
      top: 50%;
      left: 50%;
      margin-top: -141px;
      margin-left: -141px;
      outline: 200px solid var(--color-blue-grey-200);

      @media (max-width: 567px) {
        outline: none;
        width: 248px;
        height: 248px;
        margin-top: -124px;
        margin-left: -124px;
      }
    }
  }
`;
