import React, { FC } from 'react'
import { useQuery } from '@apollo/client'
import { Heading } from '@unique-nft/ui-kit'

import LoadingComponent from '../../../components/LoadingComponent'
import { BlockDetailData, BlockDetailVariables, blockDetail } from '../../../api/graphQL'

const BlockDetailComponent = (props: any) => {
  const { block_number } = props
  const {
    loading: isBLockFetching,
    error: fetchBlockError,
    data: blockDetails,
  } = useQuery<BlockDetailData, BlockDetailVariables>(blockDetail.getBlockQuery, {
    variables: { block_number },
    notifyOnNetworkStatusChange: true,
  })

  if (isBLockFetching) return <LoadingComponent />

  const {
    timestamp,
    total_events,
    spec_version,
    block_hash,
    parent_hash,
    extrinsics_root,
    state_root,
  } = blockDetails?.block[0] || {}

  return (
    <>
      <Heading>{`Block ${block_number}`}</Heading>
      <div className={'grid-container container-with-border grid-container_extrinsic-container'}>
        <div className={'grid-item_col2 text_grey'}>Status</div>
        <div className={'grid-item_col10'}>Unavailable</div>
        <div className={'grid-item_col2 text_grey'}>Timestamp</div>
        <div className={'grid-item_col10'}>
          {timestamp && new Date(timestamp * 1000).toLocaleString()}
        </div>
      </div>

      <div className={'grid-container container-with-border grid-container_extrinsic-container'}>
        <div className={'grid-item_col2 text_grey'}>Total events</div>
        <div className={'grid-item_col10'}>{total_events}</div>
        <div className={'grid-item_col2 text_grey'}>Spec version</div>
        <div className={'grid-item_col10'}>{spec_version}</div>
      </div>

      <div className={'grid-container grid-container_extrinsic-container'}>
        <div className={'grid-item_col2 text_grey'}>Block hash</div>
        <div className={'grid-item_col10'}>
          <div title={block_hash} className={'block__text-wrap'}>
            {block_hash}
          </div>
        </div>

        <div className={'grid-item_col2 text_grey'}>Parent hash</div>
        <div className={'grid-item_col10'}>
          <div title={parent_hash} className={'block__text-wrap'}>
            {parent_hash}
          </div>
        </div>

        <div className={'grid-item_col2 text_grey'}>Extrinsic root</div>
        <div className={'grid-item_col10'}>
          <div title={extrinsics_root} className={'block__text-wrap'}>
            {extrinsics_root}
          </div>
        </div>

        <div className={'grid-item_col2 text_grey'}>State root</div>
        <div className={'grid-item_col10'}>
          <div title={state_root} className={'block__text-wrap'}>
            {state_root}
          </div>
        </div>
      </div>
    </>
  )
}

export default BlockDetailComponent
