import { Heading } from '@unique-nft/ui-kit';
import { FC, useState } from 'react';
import styled from 'styled-components';
import { Picture } from '..';
import { Token } from '../../api/graphQL/tokens/types';

type TTokensCard = Token

export const TokensCard: FC<TTokensCard> = (props) => {
    const [tokenImageUrl, setTokenImageUrl] = useState<string>();
    const { collection_id: collectionId, collection_name, data, id, image_path, owner, token_id: tokenId, token_prefix } = props;

    return (
        <TokensCardStyled>
            <Picture
                alt={tokenId.toString()}
                src={image_path}
            />
            <div className={'flexbox-container flexbox-container_column flexbox-container_without-gap'}>
                <Heading size={'4'}>{`${token_prefix || ''} #${tokenId}`}</Heading>
                <div>
                    <a>
                        {collection_name} [ID&nbsp;{collectionId}]
                    </a>
                </div>
                <div className={'text_grey margin-top'}>Transfers: 0</div>
            </div>
        </TokensCardStyled>
    );
};

const TokensCardStyled = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;

  .picture{
      width: 168px;
      height: 168px;
      svg{
        border-radius: 8px;
      }
  }
`;
