import React, { useCallback } from 'react';
import { Heading } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';
import { Primary600 } from '../../../styles/colors';
import { NotificationSeverity } from '../../../notification/NotificationContext';
import { useNotification } from '../../../hooks/useNotification';
import copyIcon from '../../../static/icons/copy_blue.svg';
import facebookIcon from '../../../static/icons/facebook.svg';
import redditIcon from '../../../static/icons/reddit.svg';
import telegramIcon from '../../../static/icons/telegram.svg';
import twitterIcon from '../../../static/icons/twitter.svg';
import { TelegramShareButton, TwitterShareButton, FacebookShareButton, RedditShareButton } from '../../../components/ShareButton';

export const ShareTokenModal = () => {
  const { push } = useNotification();
  const copyUrl = useCallback(() => {
    void navigator.clipboard.writeText(window.location.href).then(() => {
      push({ severity: NotificationSeverity.success, message: 'Link copied' });
    });
  }, [push]);

  return (
    <>
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
    </>
  );
};

const HeadingWrapper = styled.div`
  margin-bottom: 24px;
`;

const SocialButtonsWrapper = styled.div`
  font-size: 16px;
  display: flex;
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
