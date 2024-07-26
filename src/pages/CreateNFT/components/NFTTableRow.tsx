import React from 'react';
import styled from 'styled-components';

interface NFT {
  id: number;
  imageUrl: string;
}

interface NFTTableRowProps {
  item: { nft: NFT };
  commonProps: {};
}

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const TableCell = styled.td`
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
`;

const Image = styled.img`
  width: 50px;
  height: 50px;
`;

const NFTTableRow: React.FC<NFTTableRowProps> = ({ item }) => {
  const { nft } = item;

  return (
    <TableRow>
      <TableCell>#{nft.id}</TableCell>
      <TableCell><Image src={nft.imageUrl} alt={`NFT ${nft.id}`} /></TableCell>
      <TableCell><a href="#">Upload</a></TableCell>
      <TableCell><a href="#">Upload multiple items</a></TableCell>
      <TableCell><button disabled>Set for all</button></TableCell>
    </TableRow>
  );
};

export default NFTTableRow;
