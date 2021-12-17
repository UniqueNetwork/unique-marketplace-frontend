import React, { FC, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import {
  extrinsicQuery,
  Data as extrinsicData,
  Variables as ExtrinsicVariables,
} from '../../../api/graphQL/extrinsic'
import AccountLinkComponent from '../../Account/components/AccountLinkComponent'

const ExtrinsicDetail: FC = () => {

  const { blockIndex } = useParams();

  const {
    fetchMore: fetchMoreExtrinsic,
    data: extrinsics,
  } = useQuery<extrinsicData, ExtrinsicVariables>(
    extrinsicQuery,
    {
      variables: { block_index: blockIndex || '' },
      fetchPolicy: 'network-only',
    },
  );

  if (!blockIndex) return null;

  return (
    <>
      <h1>Extrinsic {blockIndex}</h1>
      <div className={'grid-container container-with-border'}>
        <div className={'grid-item_col1 text_grey'}>Block </div>
        <div className={'grid-item_col11'}>
          {extrinsics?.view_extrinsic[0]?.block_number}
        </div>
        <div className={'grid-item_col1 text_grey margin-top '}>Timestamp </div>
        <div className={'grid-item_col11 margin-top '}>
          {extrinsics?.view_extrinsic[0]?.timestamp && new Date(extrinsics?.view_extrinsic[0]?.timestamp).toLocaleString()}
        </div>
      </div>
      <div className={'grid-container container-with-border margin-top'}>
        <div className={'grid-item_col1 text_grey'}>Sender </div>
        <div className={'grid-item_col11'}>
          {extrinsics?.view_extrinsic[0]?.from_owner && <AccountLinkComponent value={extrinsics?.view_extrinsic[0]?.from_owner} />}
        </div>
        <div className={'grid-item_col1 text_grey margin-top '}>Destination </div>
        <div className={'grid-item_col11 margin-top '}>
          {extrinsics?.view_extrinsic[0]?.to_owner && <AccountLinkComponent value={extrinsics?.view_extrinsic[0]?.to_owner} />}
        </div>
      </div>
      <div className={'grid-container container-with-border margin-top'}>
        <div className={'grid-item_col1 text_grey'}>Amount </div>
        <div className={'grid-item_col11'}>
          {extrinsics?.view_extrinsic[0]?.amount}
        </div>
        <div className={'grid-item_col1 text_grey margin-top '}>Fee </div>
        <div className={'grid-item_col11 margin-top '}>
          {extrinsics?.view_extrinsic[0]?.fee}
        </div>
      </div>
      <div className={'grid-container margin-top'}>
        <div className={'grid-item_col1 text_grey'}>Hash </div>
        <div className={'grid-item_col11'}>
          {extrinsics?.view_extrinsic[0]?.hash}
        </div>
        <div className={'grid-item_col1 text_grey margin-top '}>Extrinsic </div>
        <div className={'grid-item_col11 margin-top '}>{blockIndex}</div>
      </div>
    </>
  )
}

export default ExtrinsicDetail
