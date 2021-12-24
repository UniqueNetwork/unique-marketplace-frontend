import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import {
  extrinsicQuery,
  Data as extrinsicData,
  Variables as ExtrinsicVariables,
} from '../../../api/graphQL/extrinsic'
import AccountLinkComponent from '../../Account/components/AccountLinkComponent'
import LoadingComponent from '../../../components/LoadingComponent'
import { Heading } from '@unique-nft/ui-kit'

const ExtrinsicDetail: FC = () => {
  const { blockIndex } = useParams()

  const {
    loading: isExtrinsicFetching,
    data: extrinsics,
  } = useQuery<extrinsicData,
    ExtrinsicVariables>(extrinsicQuery, {
    variables: { block_index: blockIndex || '' },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  if (!blockIndex) return null

  if (isExtrinsicFetching) return <LoadingComponent />

  const {
    block_number: blockNumber,
    from_owner: fromOwner,
    to_owner: toOwner,
    timestamp,
    amount,
    fee,
    hash,
  } = extrinsics?.view_extrinsic[0] || {}

  return (<>
    <Heading>{`Extrinsic ${blockIndex}`}</Heading>
    <div className={'grid-container container-with-border extrinsic-block-container'}>
      <div className={'grid-item_col1 text_grey'}>Block</div>
      <div className={'grid-item_col11'}>{blockNumber}</div>
      <div className={'grid-item_col1 text_grey margin-top '}>Timestamp</div>
      <div className={'grid-item_col11 margin-top '}>
        {timestamp && new Date(timestamp).toLocaleString()}
      </div>
    </div>
    <div className={'grid-container container-with-border extrinsic-block-container'}>
      <div className={'grid-item_col1 text_grey'}>Sender</div>
      <div className={'grid-item_col11'}>
        {fromOwner && (
          <AccountLinkComponent value={fromOwner} />
        )}
      </div>
      <div className={'grid-item_col1 text_grey margin-top '}>Destination</div>
      <div className={'grid-item_col11 margin-top '}>
        {toOwner && (
          <AccountLinkComponent value={toOwner} />
        )}
      </div>
    </div>
    <div className={'grid-container container-with-border extrinsic-block-container'}>
      <div className={'grid-item_col1 text_grey'}>Amount</div>
      {/* TODO: due to API issues - amount of some transactions is object which is, for now, should be translated as zero */}
      <div className={'grid-item_col11'}>
        {Number(amount) || 0} QTZ
      </div>
      <div className={'grid-item_col1 text_grey margin-top '}>Fee</div>
      <div className={'grid-item_col11 margin-top '}>{Number(fee) || 0} QTZ</div>
    </div>
    <div className={'grid-container extrinsic-block-container'}>
      <div className={'grid-item_col1 text_grey'}>Hash</div>
      <div className={'grid-item_col11'}>{hash}</div>
      <div className={'grid-item_col1 text_grey margin-top '}>Extrinsic</div>
      <div className={'grid-item_col11 margin-top '}>{blockIndex}</div>
    </div>
  </>)
}

export default ExtrinsicDetail
