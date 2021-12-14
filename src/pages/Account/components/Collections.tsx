import React, { FC } from 'react'
import Table from 'rc-table'
import { useQuery } from '@apollo/client'
import { collectionsQuery, Data as collectionsData, Variables as CollectionsVariables } from '../../../api/graphQL/collections'


const columns = [
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    width: 400,
  },
];

const Collections: FC = () => {

  const {
    data: collections,
  } = useQuery<collectionsData, CollectionsVariables>(collectionsQuery, {
    variables: { limit: 6, offset: 0 },
  });

  return (
    <>
      <div>
        <span><input type={'text'} placeholder="Collection name"/> <button type="button" >Search</button></span>
        <span><input type={'checkbox'} /> All</span>
        <span><input type={'checkbox'} /> Owner</span>
      </div>
      <div>
        <Table
          columns={columns}
          data={collections?.collections}
          rowKey={'block_hash'}
        />
      </div>
    </>
  )
}

export default React.memo(Collections);
