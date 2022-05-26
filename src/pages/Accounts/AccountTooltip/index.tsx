import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { AdditionalDark, AdditionalLight } from '../../../styles/colors';

const AccountTooltip = () => {
  const [accountPopupVisible, setAccountPopupVisible] = useState(false);

  useEffect(() => {
    const questionIcon = document.querySelector('[data-testid="icon-question"]');
    const onQuestionHover = (e: MouseEvent) => {
      if (
        e.target === questionIcon ||
        (e.target as HTMLElement).closest('[data-testid="icon-question"]') ||
        (e.target as HTMLElement).closest('[id="account-popup"]')) {
        setAccountPopupVisible(true);
      } else setAccountPopupVisible(false);
    };
    document.addEventListener('mouseover', onQuestionHover);
    return () => {
      document.removeEventListener('mouseover', onQuestionHover);
    };
  }, []);

  return (
    <>
      {accountPopupVisible && <TooltipStyled id={'account-popup'}>
        Substrate account addresses (Kusama, Quartz, Polkadot, Unique, etc.) may be represented by a different address
        character sequence, but they can be converted between each other because they share the same public key. You
        can see all transformations for any given address on <a href='https://quartz.subscan.io/' target='_blank' rel='noreferrer'>Subscan</a>.
      </TooltipStyled>}
    </>
  );
};

const TooltipStyled = styled.div`
  position: absolute;
  background: ${AdditionalDark};
  width: 400px;
  color: ${AdditionalLight};
  z-index: 1;
  left: 95px;
  top: 10px;
  padding: 8px 16px;
  line-height: 22px;
  border-radius: 2px;

  ::before {
    position: absolute;
    content: "";
    width: 0;
    height: 0;
    left: -7px;
    top: 5px;
    border-top: 5px solid transparent;
    border-right: 7px solid ${AdditionalDark};
    border-bottom: 5px solid transparent;
  }

  a {
    color: ${AdditionalLight};
    text-decoration: underline;
  }

  a:hover {
    text-decoration: none;
  }
`;

export default AccountTooltip;
