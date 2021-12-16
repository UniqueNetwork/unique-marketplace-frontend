import React, { FC, useMemo } from 'react'
import { classNames } from '../utils/classNames'

interface ButtonProps {
  text: string;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
  type?: 'primary' | 'secondary' | 'outlined';
}

const Button: FC<ButtonProps> = (props) => {
  const { text, icon, onClick, disabled, iconPosition = 'left', type = 'primary' } = props;

  const _classNames = useMemo(() => classNames({
    'primary': type === 'primary',
    'secondary': type === 'secondary',
    'disabled': !!disabled,
    'icon-right': iconPosition === 'right',
  }), [type, disabled, iconPosition]);

  return (
    <button className={`button ${_classNames}`} type="button" onClick={onClick} disabled={disabled}>
      {icon && <span className={'button__icon'}>{icon}</span>}
      {text}
    </button>
  )
}

export default React.memo(Button);
