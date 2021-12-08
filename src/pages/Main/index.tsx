import React from 'react'
import { useQuery } from '@apollo/client'
import { exampleBlocks, Data as BlocksData } from '../../api/graphQL/exampleQuery'

const MainPage = () => {
  const {
    loading: isBlocksFetching,
    error: fetchBlocksError,
    data: blocks,
  } = useQuery<BlocksData>(exampleBlocks)

  return (
    <div>
      <span>Is fetching: {!!isBlocksFetching ? 'yes' : 'finished'}</span>
      <br />
      {!!fetchBlocksError && <span>Get blocks error: {fetchBlocksError}</span>}
      {blocks?.block?.map((block: any) => (
        <span key={block.block_hash}>{JSON.stringify(block)}</span>
      ))}
    </div>
  )
}

export default MainPage
