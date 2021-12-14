import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import {
  extrinsicQuery,
  Data as extrinsicData,
  Variables as ExtrinsicVariables,
} from '../../../api/graphQL/extrinsic'

const ExtrinsicDetail: FC = () => {

  const { blockIndex } = useParams();

  const {
    data: extrinsic,
  } = useQuery<extrinsicData, ExtrinsicVariables>(
    extrinsicQuery,
    { variables: { block_index: blockIndex || '' }},
  );

  if (!blockIndex) return null;

  return (
    <>
      <h1>Extrinsic {blockIndex}</h1>
      <div>
        <div>
          <span>Block </span>
          <span>{extrinsic?.view_extrinsic[0]?.block_number}</span>
        </div>
        <div>
          <span>Timestamp </span>
          <span>{extrinsic?.view_extrinsic[0]?.timestamp && new Date(extrinsic?.view_extrinsic[0]?.timestamp).toLocaleString()}</span>
        </div>
      </div>
      <div>
        <div>
          <span>Sender </span>
          <span>{extrinsic?.view_extrinsic[0]?.from_owner}</span>
        </div>
        <div>
          <span>Destination </span>
          <span>{extrinsic?.view_extrinsic[0]?.to_owner}</span>
        </div>
      </div>
      <div>
        <div>
          <span>Amount </span>
          <span>{extrinsic?.view_extrinsic[0]?.amount}</span>
        </div>
        <div>
          <span>Fee </span>
          <span>{extrinsic?.view_extrinsic[0]?.fee}</span>
        </div>
      </div>
      <div>
        <div>
          <span>Hash </span>
          <span>{extrinsic?.view_extrinsic[0]?.hash}</span>
        </div>
        <div>
          <span>Extrinsic </span>
          <span>{blockIndex}</span>
        </div>
      </div>

    </>
  )
}

export default ExtrinsicDetail
