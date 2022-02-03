import { Button, Heading, Text } from '@unique-nft/ui-kit';
import { FC } from 'react';
import styled from 'styled-components/macro';
import { Token } from '../../../api/graphQL/tokens/types';
import { AdditionalColorLight } from '../../../styles/colors';
import logoKusama from '../../../static/icons/logo-kusama.svg';
import { Icon } from '../../Icon/Icon';
import { Collection } from '../../../api/graphQL/collections/types';
import { CommonTokenDetail } from '../SharedComponents/CommonTokenDetail';

interface BuyTokenProps {
  token: Token;
  collection: Collection;
}

export const BuyToken: FC<BuyTokenProps> = ({ collection, token }) => {
  const { collection_id: collectionId,
    count_of_views: countOfViews,
    data,
    fee = 0.15,
    id,
    image_path: imagePath,
    owner,
    price = 234,
    token_id: tokenId,
    token_prefix } = token;

    const currency = 'KSM';

  return (

    <CommonTokenDetail
collection={collection}
token={token}
    >
      <Row>
        <LogoKusama>
          <Icon path={logoKusama} />
        </LogoKusama>
        <Heading
          size={'1'}
        >{`${price + fee}`}</Heading>
      </Row>
      <Row>
        <Text
          color='grey-500'
          size='m'
        >
          {`price ${price} ${currency} + fee ${fee} ${currency}`}
        </Text>
      </Row>
      <ButtonWrapper>
        <Button
          onClick={() => {
            console.log('buy click');
          } }
          role='primary'
          title='Buy'
          wide={true}
        />
      </ButtonWrapper>
    </CommonTokenDetail>
  );
};

const LogoKusama = styled.div`
margin-right:8px;
svg {fill: ${AdditionalColorLight}}
`;

const Row = styled.div`
display: flex;
align-items: center;

 && h1{
  margin-bottom: 0;
}
`;

const ButtonWrapper = styled.div`
width: 200px;
margin-top: 24px;
`;
