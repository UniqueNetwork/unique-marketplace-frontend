import { VFC } from 'react';
import styled from 'styled-components/macro';
// import Jdenticon from 'react-jdenticon';

interface IdentityIconProps {
  address: string;
  className?: string;
  copyable?: boolean;
  size?: string;
}

export const IdentityIcon: VFC<IdentityIconProps> = ({
  address,
  className,
  copyable,
  size = '16',
}) => {
  const handleAddressCopy = () => {
    if (!copyable) {
      return;
    }

    navigator.clipboard.writeText(address);
  };

  return (
    <Wrapper copyable={copyable} className={className} onClick={handleAddressCopy}>
      {/* <Jdenticon size={size} value={address} /> */}
    </Wrapper>
  );
};

const Wrapper = styled.div.attrs<{ copyable?: boolean }>((props) => ({
  copyable: props.copyable,
}))<{ copyable?: boolean }>`
  display: flex;
  align-items: center;
  cursor: ${(props) => (props.copyable ? 'pointer' : 'normal')};

  div {
    display: flex;
    align-items: center;
  }
`;
