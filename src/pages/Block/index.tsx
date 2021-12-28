import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs } from '@unique-nft/ui-kit';
import { useQuery } from '@apollo/client';
import BlockDetailComponent from './components/BlockDetailComponent';


const assetsTabs = ['Collections', 'Tokens'];

const BlockPage = () => {

  const { blockIndex } = useParams();
  const pageSize = 10; // default

  const [activeAssetsTabIndex, setActiveAssetsTabIndex] = useState<number>(0);


  return (
    <div>
      <BlockDetailComponent block_number={blockIndex} />

      <div className={'margin-bottom'}></div>
      <div className={'margin-bottom'}></div>
      <Tabs
        activeIndex={activeAssetsTabIndex}
        labels={assetsTabs}
        onClick={setActiveAssetsTabIndex}
      />
      <Tabs
        activeIndex={activeAssetsTabIndex}
        contents={[
          <div>1</div>,
          <div>2</div>
        ]}
      />
      123
    </div>
  );
};

export default BlockPage;
