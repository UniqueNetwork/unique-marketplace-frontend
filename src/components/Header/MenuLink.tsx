import { ITextBaseProps, Text } from 'components/UI/Text/Text';
import { FCC } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface IMenuLink extends ITextBaseProps {
  to: string
  active?: boolean
  disabled?: boolean
}

interface IMobileMenuLink extends IMenuLink {
  onClick(): void
}

export const DesktopMenuLink: FCC<IMenuLink> = ({
  to,
  active = false,
  disabled = false,
  color = 'additional-dark',
  size = 'm',
  weight = 'regular',
  appearance,
  children
}) => {
  if (disabled) {
    return (
      <DesktopMenuItem
        $disabled
        $active={active}
        color={color}
        size={size}
        weight={weight}
        appearance={appearance}
      >
        {children}
      </DesktopMenuItem>
    );
  }
  return (
    <Link to={to}>
      <DesktopMenuItem
        $active={active}
        color={color}
        size={size}
        weight={weight}
        appearance={appearance}
      >
        {children}
      </DesktopMenuItem>
    </Link>
  );
};

export const DesktopMenuItem = styled(Text) <{ $active?: boolean, $disabled?: boolean }>`
  && {
    margin-right: 24px;
    color: ${(props) => props.$disabled ? 'var(--color-blue-grey-500)' : (props.$active ? 'var(--color-additional-dark)' : 'var(--color-primary-500)')};
    border-bottom: ${(props) => props.$active ? '1px solid var(--color-additional-dark)' : 'none'};
    &:hover {
      color: ${(props) => props.$disabled ? 'var(--color-blue-grey-500)' : (props.$active ? 'var(--color-additional-dark)' : 'var(--color-primary-400)')};
      cursor: ${(props) => props.$disabled ? 'not-allowed' : 'pointer'};
    }
  }
`;

export const MobileMenuLink: FCC<IMobileMenuLink> = ({
  to,
  active = false,
  disabled = false,
  color = 'additional-dark',
  size = 'm',
  weight = 'regular',
  appearance,
  children,
  onClick
}) => {
  if (disabled) {
    return (
      <MobileMenuItem
        $disabled
        $active={active}
        color={color}
        size={size}
        weight={weight}
        appearance={appearance}
      >
        {children}
      </MobileMenuItem>
    );
  }
  return (
    <LinkWrapper onClick={onClick}>
      <Link to={to}>
        <TextStyled
          $active={active}
          color={color}
          size={size}
          weight={weight}
          appearance={appearance}
        >
          {children}
        </TextStyled>
      </Link>
    </LinkWrapper>
  );
};

export const MobileMenuItem = styled(Text) <{ $active?: boolean, $disabled?: boolean }>`
  && {
    margin-right: 24px;
    color: ${(props) => props.$disabled ? 'var(--color-blue-grey-500)' : (props.$active ? 'var(--color-additional-dark)' : 'var(--color-primary-500)')};
    border-bottom: ${(props) => props.$active ? '1px solid var(--color-additional-dark)' : 'none'};
    padding: ${(props) => props.$disabled && '8px 16px'};
    &:hover {
      color: ${(props) => props.$disabled ? 'var(--color-blue-grey-500)' : (props.$active ? 'var(--color-additional-dark)' : 'var(--color-primary-400)')};
      cursor: ${(props) => props.$disabled ? 'not-allowed' : 'pointer'};
    }
  }
`;

const TextStyled = styled(Text) <{ $active?: boolean }>`
  && {
    display: flex;
    border-radius: 4px;
    padding: 8px 16px;
    background-color: ${(props) => props.$active ? 'var(--color-primary-500)' : 'transparent'};
    color: ${(props) => props.$active ? 'var(--color-additional-light)' : 'var(--color-additional-dark)'};
    &:hover {
      color: ${(props) => (props.$active ? 'var(--color-additional-light)' : 'var(--color-primary-500)')};
    }
  }
`;

const LinkWrapper = styled.div`
  display: contents;
  a {
    margin-right: 0;
  }
`;
