import React, { useCallback, useState } from 'react';
import { Heading, Text } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { Grey300 } from 'styles/colors';
import { Tree } from '../TreeView/Tree';
import NodeView from './NodeView';
import dataSource from '../TreeView/mockData';
import { IData } from '../TreeView/types';
import { NestedSection } from './NestedSection';

function BundleTree() {
  const [selectedToken, setSelectedToken] = useState<IData | null>(null);
  const onNodeClicked = useCallback((data: IData) => {
    if (!data.selected) setSelectedToken(null);
    else setSelectedToken(data);
  }, []);

  return (
    <BundlePagePaper>
      <HeaderStyled>
        <Heading size={'2'}>Bundle tree structure</Heading>
        <Text color='grey-500' size='m'>13 items total</Text>
      </HeaderStyled>
      <Content>
        <TreeContainer>
          <Tree
            // @ts-ignore
            dataSource={[dataSource]}
            nodeView={NodeView}
            onNodeClicked={onNodeClicked}
          />
        </TreeContainer>
        <NestedSection selectedToken={selectedToken} />
      </Content>
    </BundlePagePaper>
  );
}

const BundlePagePaper = styled(PagePaper)`
`;

const HeaderStyled = styled.div`
  display: flex;
  gap: var(--gap);
  & > span {
    padding-top: 12px;
  }
`;

const Content = styled.div`
  display: flex;
  border: 1px solid ${Grey300};
`;

const TreeContainer = styled.div`
  width: 536px;
`;

export default BundleTree;
