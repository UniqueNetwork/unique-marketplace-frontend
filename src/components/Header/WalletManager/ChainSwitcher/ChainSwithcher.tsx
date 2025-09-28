import { Dropdown, Icon, Text, Toggle } from 'components/UI';
import { INetwork } from 'components/UI/widgets/AccountsManager';
import { useCallback } from 'react';
import styled from 'styled-components';

type ChainSwitcherProps = {
  chains: INetwork[];
  activeChain?: INetwork;
  onChainChange?(chain: INetwork): void;
}

export const ChainSwitcher = ({ chains, activeChain, onChainChange }: ChainSwitcherProps) => {
  const dropdownRender = useCallback(() => {
    return <>
      {(!chains || chains.length === 0) && activeChain && (
        <ChainToggleWrapper>
          <Icon {...activeChain.icon} size={16} />
          <Text>{activeChain.name}</Text>
        </ChainToggleWrapper>)}
      {chains?.length > 0 && (
        <ChainListWrapper>
          <CaptionText color='grey-500' size='s' weight='light' >
            Active network
          </CaptionText>
          {activeChain && [activeChain].map((network) => (
            <ChainToggleWrapper
              key={`network-${network.id}`}
              data-testid={`network-${network.id}`}
            >
              <Icon {...network.icon} size={16} />
              <Text>{network.name}</Text>
            </ChainToggleWrapper>))}
        </ChainListWrapper>)}
    </>;
  }, [chains, activeChain, onChainChange]);

  if (!activeChain) return null;

  return <DropdownStyled placement='right' dropdownRender={dropdownRender} iconRight={{ name: 'triangle', size: 8 }} >
    <ChainSwitcherWrapper>
      <Icon
        {...activeChain.icon}
        size={16}
      />
    </ChainSwitcherWrapper>
  </DropdownStyled>;
};

const DropdownStyled = styled(Dropdown)`
  .dropdown-options {
    top: calc(100% + 8px)
  }
`;

const ChainSwitcherWrapper = styled.div`
  && {
    border: 1px solid var(--color-blue-grey-200);
    box-sizing: border-box;
    border-radius: calc(var(--prop-gap) / 2);
    display: flex;
    position: relative;
    padding: calc(var(--prop-gap) * 1.5 / 4) calc(var(--prop-gap) * 2)
    calc(var(--prop-gap) * 1.5 / 4) var(--prop-gap);
    cursor: pointer;
    height: 40px;
    align-items: center;
    &:hover {
      border: 1px solid var(--color-blue-grey-400);
    }
  }
`;

const ChainListWrapper = styled.div`
&& {
  display: flex;
  flex-direction: column;
  padding: calc(var(--prop-gap) * 1.5);
  gap: calc(var(--prop-gap) / 2);
  min-width: 236px;
}
`;

const ChainToggleWrapper = styled.div`
&& {
  display: flex;
  align-items: center;
  & > span {
    margin-left: calc(var(--prop-gap) / 2);
    margin-right: var(--prop-gap);
    flex: 1;
  }
} 
`;

const CaptionText = styled(Text)`
  line-height: 20px;
  font-weight: 400;
`;
