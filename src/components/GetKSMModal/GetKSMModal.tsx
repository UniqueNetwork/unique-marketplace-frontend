// Copyright 2017-2022 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import React, { useCallback, useEffect, useRef } from 'react';

import { Modal } from '@unique-nft/ui-kit';
import config from '../../config';
import styled from 'styled-components';

interface Props {
  onClose: () => void;
}

function GetKSMModal ({ onClose }: Props): React.ReactElement<Props> {
  const ref = useRef<HTMLDivElement>(null);

  const handleGetKSMClickByRamp = useCallback(() => {
    const containerNode = ref.current ?? document.getElementById('root') as HTMLDivElement;

    const RampModal = new RampInstantSDK({
      containerNode,
      hostApiKey: config.rampApiKey,
      hostAppName: 'Unique Marketplace',
      hostLogoUrl: 'https://wallet.unique.network/logos/unique_logo.svg',
      swapAsset: 'KSM',
      variant: 'embedded-mobile'
    });

    RampModal
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .on('WIDGET_CLOSE', () => {
      onClose();
    })
    .show();
  }, [onClose]);

  useEffect(() => {
    handleGetKSMClickByRamp();
  }, [handleGetKSMClickByRamp]);

  return (
    <GetKSMModalWrapper>
      <Modal
        isVisible
        isClosable
        onClose={onClose}
      >
        <Content ref={ref} />
      </Modal>
    </GetKSMModalWrapper>
  );
}

const Content = styled.div`
  height: 720px;
  width: calc(640px - var(--prop-gap) * 3);
  @media (max-width: 567px) {
    width: unset;
  }
`;

const GetKSMModalWrapper = styled.div`
  @media (max-width: 567px) {
    .unique-modal-wrapper {
      background-color: transparent;
    }
    .unique-modal {
      top: 85px;
      padding: 0;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
    }
  }
`;

export default React.memo(GetKSMModal);
