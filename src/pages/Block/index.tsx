import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs } from '@unique-nft/ui-kit';
import { useQuery } from '@apollo/client';
import BlockDetailComponent from './components/BlockDetailComponent';
import ExtrinsicsListComponent from './components/ExtrinsicsListComponent';
import EventListComponent from './components/EventsListComponent';


const assetsTabs = ['Extrinsics', 'Events'];

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
          <ExtrinsicsListComponent blockNumber={blockIndex} />,
          <EventListComponent blockNumber={blockIndex} />,
        ]}
      />
    </div>
  );
};

export default BlockPage;
