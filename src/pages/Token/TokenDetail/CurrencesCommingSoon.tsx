import React from 'react';
import { Icon, Text } from 'components/UI';
import styled from 'styled-components';
import USDTIcon from 'static/images/usdt.png';
import DOTIcon from 'static/images/dot.png';

const ComingSoonWrapper = styled.div`
  position: relative;
`;

const ComingSoonItemsWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: #B0BEC5;
  opacity: 0.6;
  padding: 6px;
  border-radius: 8px;
`;

const ComingSoonItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ComingSoonMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #388E3C;
  background-color: #C8E6C9;
  border-radius: 16px;
  padding: 4px 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ComingSoon = () => {
  return (
    <ComingSoonWrapper>
      <ComingSoonItemsWrap>
        <ComingSoonItem>
          <Icon size={24} file={DOTIcon} />
          <Text>DOT</Text>
        </ComingSoonItem>
        <ComingSoonItem>
          <Icon size={24} file={USDTIcon} />
          <Text>USDT</Text>
        </ComingSoonItem>
      </ComingSoonItemsWrap>
      <ComingSoonMessage>
        <Text>Coming Soon</Text>
      </ComingSoonMessage>
    </ComingSoonWrapper>
  );
};

export default ComingSoon;
