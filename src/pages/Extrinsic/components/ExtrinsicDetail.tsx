import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { Heading, Text } from '@unique-nft/ui-kit'
import { extrinsic as gqlExtrinsic } from '../../../api/graphQL'
import AccountLinkComponent from '../../Account/components/AccountLinkComponent'
import LoadingComponent from '../../../components/LoadingComponent'
import useDeviceSize, { DeviceSize } from '../../../hooks/useDeviceSize'
import { shortcutText } from '../../../utils/textUtils'
import ChainLogo from '../../../components/ChainLogo'
import { useApi } from '../../../hooks/useApi'

const ExtrinsicDetail: FC = () => {
  const { blockIndex } = useParams()

  const { chainData } = useApi()

  const { extrinsic, isExtrinsicFetching } = gqlExtrinsic.useGraphQlExtrinsic(blockIndex)

  const deviceSize = useDeviceSize()

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
  } = extrinsic || {}

  return (
    <>
      <Heading>{`Extrinsic ${blockIndex}`}</Heading>
      <div className={'grid-container container-with-border grid-container_extrinsic-container'}>
        <Text className={'grid-item_col1'} color={'grey-500'}>
          Block
        </Text>
        <Text className={'grid-item_col11'}>{blockNumber?.toString() || ''}</Text>
        <Text className={'grid-item_col1'} color={'grey-500'}>
          Timestamp
        </Text>
        <Text className={'grid-item_col11'}>
          {timestamp ? new Date(timestamp * 1000).toLocaleString() : ''}
        </Text>
      </div>
      <div className={'grid-container container-with-border grid-container_extrinsic-container'}>
        <Text className={'grid-item_col1'} color={'grey-500'}>
          Sender
        </Text>
        <div className={'grid-item_col11'}>
          {fromOwner && (
            <AccountLinkComponent
              value={fromOwner}
              noShort={deviceSize !== DeviceSize.sm}
              size={'m'}
            />
          )}
        </div>
        <Text className={'grid-item_col1'} color={'grey-500'}>
          Destination
        </Text>
        <div className={'grid-item_col11'}>
          {toOwner && (
            <AccountLinkComponent
              value={toOwner}
              noShort={deviceSize !== DeviceSize.sm}
              size={'m'}
            />
          )}
        </div>
      </div>
      <div className={'grid-container container-with-border grid-container_extrinsic-container'}>
        <Text className={'grid-item_col1 '} color={'grey-500'}>
          Amount
        </Text>
        {/* TODO: due to API issues - amount of some transactions is object which is, for now, should be translated as zero */}
        <div className={'grid-item_col11'}>
          <ChainLogo isInline={true} />
          {Number(amount) || 0} {chainData?.properties.tokenSymbol}
        </div>
        <Text className={'grid-item_col1'} color={'grey-500'}>
          Fee
        </Text>
        <div className={'grid-item_col11'}>
          <ChainLogo isInline={true} />
          {Number(fee) || 0} {chainData?.properties.tokenSymbol}
        </div>
      </div>
      <div className={'grid-container grid-container_extrinsic-container'}>
        <Text className={'grid-item_col1'} color={'grey-500'}>
          Hash
        </Text>
        <Text className={'grid-item_col11'}>
          {hash && deviceSize !== DeviceSize.sm ? hash : shortcutText(hash!)}
        </Text>
        <Text className={'grid-item_col1'} color={'grey-500'}>
          Extrinsic
        </Text>
        <Text className={'grid-item_col11'}>{blockIndex}</Text>
      </div>
    </>
  )
}

export default ExtrinsicDetail
