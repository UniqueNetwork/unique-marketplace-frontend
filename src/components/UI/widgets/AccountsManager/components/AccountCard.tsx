import React, { ReactNode, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { IAccount } from '../AccountsManager';
import DefaultAvatar from 'static/icons/default-avatar.svg';
import useCopyToClipboard from '../hooks/useCopyToClipboard';
import styled from 'styled-components';
import { CopyButton, Text, Tooltip } from 'components/UI';
import { Avatar } from 'components';
import WalletConnect from 'static/images/walletconnect.png';

interface AccountCardProps extends IAccount {
  avatarRender?(address: string): ReactNode;
  onCopyAddressClick?(address: string): void
}

export const AccountCard = ({
  name,
  address,
  avatarRender,
  onCopyAddressClick
}: AccountCardProps) => {
  const shortAddress =
    address && address?.length > 13
      ? `${address.slice(0, 5)}...${address.slice(-5)}`
      : address;

  const { address: ethereumAddress } = useAccount();
  const { open } = useWeb3Modal();

  const [_, copy] = useCopyToClipboard();
  const nameTextRef = useRef<HTMLDivElement>(null);
  const addressTextRef = useRef<HTMLDivElement>(null);

  return (
    <AccountCardWrapper>
      {address === ethereumAddress ? <button onClick={() => open()} style={{ border: 'none', background: 'transparent', padding: 0 }}>
        <ImgWalletConnect src={WalletConnect} alt="Wallet Connect" />
      </button> : (avatarRender && address
        ? (
          avatarRender(address)
        )
        : (
          <Avatar src={DefaultAvatar} type='circle' />
        ))}
      <div className='account-card-content'>
        <TooltipStyled
          align={{ vertical: 'top', horizontal: 'middle', appearance: 'vertical' }}
          targetRef={nameTextRef}
        >
          {name}
        </TooltipStyled>
        <Text size='m' ref={nameTextRef} >{name}</Text>
        <div className='account-card-address'>
          <TooltipStyled
            align={{ vertical: 'top', horizontal: 'middle', appearance: 'vertical' }}
            targetRef={addressTextRef}
          >
            {address}
          </TooltipStyled>
          <Text size='s' color='grey-500' ref={addressTextRef}>
            {shortAddress}
          </Text>
          <CopyButton
            onClick={(event) => {
              if (!address) return;
              event.stopPropagation();
              copy(address);
              onCopyAddressClick?.(address);
            }}
            data-testid={`address-copy-${address}`}
          />
        </div>
      </div>
    </AccountCardWrapper>
  );
};

const AccountCardWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: calc(var(--prop-gap) / 2);
  .account-card-content {
    display: flex;
    flex-direction: column;
    &>.unique-text {
      max-width: 130px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      position: relative;
    }
    .account-card-address {
      display: flex;
      align-items: center;
      column-gap: calc(var(--prop-gap) / 4);
    }
  }
`;

const TooltipStyled = styled(Tooltip)`
  z-index: 9999;
  max-width: unset;
`;

const ImgWalletConnect = styled.img`
  border-radius: 6px;
  widht: 30px;
  height: 30px;
  cursor: pointer;
`;