import React, { FC } from 'react';
import { Royalty } from '@unique-nft/sdk';
import styled from 'styled-components';
import { Heading, Text } from 'components/UI';
import { OwnerCard } from 'components/OwnerCard/OwnerCard';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';

interface IProps {
  royalties: Royalty[];
}

export const RoyaltiesBlock: FC<IProps> = ({ royalties }: IProps) => {
  const deviceSize = useDeviceSize();

  return (
    <>
      <HeadingStyled size={'4'}>Royalties</HeadingStyled>
      <>
        {royalties.map(({ address, percent }) => (
          <RoyltyLine>
            <OwnerCard
              address={address}
              isShort={deviceSize < DeviceSize.xl}
              canCopy={false}
              prefixOwned=''
              prefixNested=''
              notOwned={true}
            />
            &nbsp;&nbsp;
            <Text color='grey-500'>- {percent}%</Text>
          </RoyltyLine>
        ))}
      </>
    </>
  );
};

const RoyltyLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
`;

const HeadingStyled = styled(Heading)`
  margin-bottom: 16px;
`;
