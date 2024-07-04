import React from 'react';
import { Icon, Text } from 'components/UI';
import styled from 'styled-components';
import USDTIcon from 'static/images/usdt.png';
import DOTIcon from 'static/images/dot.png';
import { Grey200, Primary400 } from 'styles/colors';

const ComingSoonWrapper = styled.div`
  position: relative;
`;

const ComingSoonItemsWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const ComingSoonItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  background: ${Grey200};
  opacity: .4;
`;

const ComingSoonMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) skew(-20deg);
  text-align: center;
  width: 120px;
  height: 30px;
  background-color: ${Primary400};
  padding: 4px 16px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  border-radius: 20px 8px;
`;

const ComingSoonText = styled(Text)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #FFF;
  font-weight: 800;
  font-size: 18px
`;

const ComingSoon = () => {
  return (
    <ComingSoonWrapper>
      <ComingSoonItemsWrap>
        <ComingSoonItem>
          <Icon size={20} file={DOTIcon} />
          <Text>DOT</Text>
        </ComingSoonItem>
        <ComingSoonItem>
          <Icon size={20} file={USDTIcon} />
          <Text>USDT</Text>
        </ComingSoonItem>
      </ComingSoonItemsWrap>
      <ComingSoonMessage>
      </ComingSoonMessage>
      <ComingSoonText>Coming Soon</ComingSoonText>
    </ComingSoonWrapper>
  );
};

export default ComingSoon;
