import React, { FC, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import {
  extrinsicQuery,
  Data as extrinsicData,
  Variables as ExtrinsicVariables,
} from '../../../api/graphQL/extrinsic'

const ExtrinsicDetail: FC = () => {

  const {extrinsicId} = useParams();

  const variables = useMemo<ExtrinsicVariables | undefined>(() => {
    const parted =  extrinsicId?.split('-');
    if (!parted || !parted[0] || !parted[1]) return undefined;
    return { block_number: parted[0], extrinsic_index: parseInt(parted[1], 10) };
  } , [extrinsicId])

  const {
    data: extrinsic,
  } = useQuery<extrinsicData, ExtrinsicVariables>(extrinsicQuery, {
    variables,
  });

  return (
    <>
      <h1>Extrinsic {extrinsicId}</h1>
      <div>
        <div>
          <span>Block </span>
          <span>{extrinsic?.extrinsic_by_pk.block_number}</span>
        </div>
        <div>
          <span>Timestamp </span>
          <span></span>
        </div>
      </div>
      <div>
        <div>
          <span>Sender </span>
          <span></span>
        </div>
        <div>
          <span>Destination </span>
          <span></span>
        </div>
      </div>
      <div>
        <div>
          <span>Amount </span>
          <span></span>
        </div>
        <div>
          <span>Fee </span>
          <span></span>
        </div>
      </div>
      <div>
        <div>
          <span>Hash </span>
          <span>{extrinsic?.extrinsic_by_pk.hash}</span>
        </div>
        <div>
          <span>Extrinsic </span>
          <span>{extrinsicId}</span>
        </div>
      </div>

    </>
  )
}

export default ExtrinsicDetail
