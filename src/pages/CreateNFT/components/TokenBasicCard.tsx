//@ts-nocheck
import { id } from 'date-fns/locale';
import styled from 'styled-components';

import { Button, Checkbox, Text } from 'components/UI';

import trash from '../../../static/icons/trash.svg';
import { NewToken, NewToken2 } from '../types';
import emptyImage from 'static/icons/empty-image.svg';
import { useState } from 'react';
import classNames from 'classnames';

type TokenBasicCardProps = {
  onChange?(token: NewToken[] | NewToken2[]): void;
  onRemove?(): void;
  token: NewToken;
  tokenPrefix: string;
};

export const TokenBasicCard = ({
  token,
  tokenPrefix,
  onChange,
  onRemove
}: TokenBasicCardProps) => {
  const onSelect = () => {
    onChange?.({ ...token, isSelected: !token.isSelected });
  };

  return (
    <TokenBasicWrapper>
      <TokenLinkImageWrapper>
        <TokenImage alt={`${tokenPrefix}_${id}`} image={token.image.url} />
        {!!onChange && (
          <SelectCheckbox label=''
            checked={token.isSelected}
            onChange={onSelect}
            testid='select'
          />
        )}
      </TokenLinkImageWrapper>
      <TokenCardActions>
        <TokenLinkTitle>{`${tokenPrefix} #${token.tokenId}`}</TokenLinkTitle>
        {onRemove && (
          <Button
            title=''
            role='ghost'
            iconLeft={{ file: trash, size: 24 }}
            onClick={onRemove}
          />
        )}
      </TokenCardActions>
    </TokenBasicWrapper>
  );
};

const TokenBasicWrapper = styled.div`
  display: block;

  min-width: 300px;
`;

const TokenLinkImageWrapper = styled.div`
  position: relative;
  width: 250px;
  height: 250px;
`;

const TokenCardActions = styled.div`
  padding: calc(var(--prop-gap) / 2) 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 250px;
  background-color: white;
  .unique-button {
    padding: 0;
  }
`;

const TokenLinkTitle = styled(Text).attrs({ appearance: 'block', size: 'l' })`
  word-break: break-all;
`;
const SelectCheckbox = styled(Checkbox)`
  position: absolute;
  top: var(--prop-gap);
  left: var(--prop-gap);
  &.unique-checkbox-wrapper.checkbox-size-s span.checkmark {
    height: 32px;
    width: 32px;
    border-radius: var(--prop-gap);
    background-color: var(--color-primary-500);
    opacity: 0.4;
    &.checked {
      opacity: 1;
    }
  }
`;

const Wrapper = styled.div`
  overflow: hidden;
  border-radius: var(--prop-border-radius);
  position: relative;
  background-color: var(--color-blue-grey-100);
  transform: translateZ(0);

  &::before {
    display: block;
    padding-bottom: 100%;
    content: '';
  }

  & > img {
    position: absolute;
    top: 50%;
    left: 50%;
    max-width: 100%;
    max-height: 100%;
    opacity: 0;
    transform: translate3d(-50%, -50%, 0);
    transition: opacity 0.15s linear;

    &._loaded {
      opacity: 1;
    }
  }
`;

export const Image = ({
  alt = '',
  className,
  image
}: {
  alt: string | undefined;
  className?: string;
  image: string | undefined;
}) => {
  const [isLoaded, setLoaded] = useState(false);

  return (
    <Wrapper className={className}>
      <img
        alt={alt}
        src={image || emptyImage}
        className={classNames({
          _loaded: isLoaded
        })}
        onLoad={() => setLoaded(true)}
      />
    </Wrapper>
  );
};

const TokenImage = styled(Image)`
  margin-bottom: calc(var(--prop-gap) / 2);
`;
