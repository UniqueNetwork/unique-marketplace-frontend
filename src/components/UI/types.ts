import { IconProps } from "./Icon/Icon";
import { ChangeEvent, KeyboardEvent } from 'react';

export type DimentionType = 'small' | 'middle' | 'large';

export interface SelectOptionProps {
  [x: string | number | symbol]: unknown;
  iconLeft?: IconProps;
  iconRight?: IconProps;
}

export type ComponentType =
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLDivElement
    | HTMLTextAreaElement;
    
export interface ComponentProps { 
  autoFocus?: boolean;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  id?: string;
  maxLength?: number;
  name?: string;
  placeholder?: string;
  tabIndex?: number;
  value?: string | undefined;
  testid?: string;
  onChange(value: SelectOptionProps | string | undefined): void;
  onBlur?(event: ChangeEvent<ComponentType>): void;
  onFocus?(event: ChangeEvent<ComponentType>): void;
  onKeyDown?(event: KeyboardEvent<ComponentType>): void;
}