import React, { useCallback } from 'react';
import { Heading, Modal, useNotifications } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { Primary600 } from 'styles/colors';
import copyIcon from 'static/icons/copy_blue.svg';
import facebookIcon from 'static/icons/facebook.svg';
import redditIcon from 'static/icons/reddit.svg';
import telegramIcon from 'static/icons/telegram.svg';
import twitterIcon from 'static/icons/twitter.svg';
import { TelegramShareButton, TwitterShareButton, FacebookShareButton, RedditShareButton } from 'components/ShareButton';

interface IShareTokenModalProps {
  isVisible: boolean;
  onClose(): void;
  testid: string;
}

const ShareTokenModal = ({ isVisible, onClose, testid }: IShareTokenModalProps) => {
  const { info } = useNotifications();

  const copyUrl = useCallback(() => {
    void navigator.clipboard.writeText(window.location.href).then(() => {
      info(
        <div data-testid={`${testid}-link-copy-success-notification`}>Link copied</div>,
        { name: 'success', size: 32, color: 'var(--color-additional-light)' }
      );
    });
  }, [info]);

  return (
    <Modal isVisible={isVisible} onClose={onClose} isClosable >
      <HeadingWrapper>
        <Heading size='2'>Share</Heading>
      </HeadingWrapper>
      <SocialButtonsWrapper>
        <TwitterShareButton url={window.location.href}>
          <img
            alt='twitterIcon'
            src={twitterIcon}
          />
          <span>Twitter</span>
        </TwitterShareButton>
        <RedditShareButton url={window.location.href}>
          <img
            alt='redditIcon'
            src={redditIcon}
          />
          <span>Reddit</span>
        </RedditShareButton>
        <TelegramShareButton url={window.location.href}>
          <img
            alt='telegramIcon'
            src={telegramIcon}
          />
          <span>Telegram</span>
        </TelegramShareButton>
        <FacebookShareButton url={window.location.href}>
          <img
            alt='facebookIcon'
            src={facebookIcon}
          />
          <span>Facebook</span>
        </FacebookShareButton>
      </SocialButtonsWrapper>
      <CopyBtnWrapper
        onClick={copyUrl}
      >
        <img
          alt='copyIcon'
          src={copyIcon}
        />
        <span>Copy link</span>
      </CopyBtnWrapper>
    </Modal>
  );
};

const HeadingWrapper = styled.div`
  margin-bottom: 24px;
`;

const SocialButtonsWrapper = styled.div`
  font-size: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 28px;
  button {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  button:hover span {
    color: ${Primary600};
  }
  @media (max-width: 567px) {
    button:first-of-type {
      margin-right: 18px;
    }
  }
`;

const CopyBtnWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 16px;
  width: 120px;
  :hover span {
    color: ${Primary600};
  }
`;

export default ShareTokenModal;
