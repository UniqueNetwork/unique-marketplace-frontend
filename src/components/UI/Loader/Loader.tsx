import { ReactNode } from 'react';
import classNames from 'classnames';

import './Loader.scss';

export type DimensionType = 'small' | 'middle' | 'large';

export type PlacementType = 'right' | 'left' | 'bottom' | 'top';

export interface LoaderProps {
  isFullPage?: boolean;
  label?: string | ReactNode | null;
  size?: DimensionType;
  placement?: PlacementType;
  state?: 'idle' | 'process' | 'done' | 'failed';
}

export const Loader = ({
  isFullPage = false,
  placement = 'right',
  size = 'small',
  label,
  state = 'process'
}: LoaderProps) => (
  <div
    className={classNames('unique-loader', {
      full: isFullPage
    })}
    role='progressbar'
  >
    <div className={classNames('loader-content', placement)}>
      <div className={classNames('loader', size, state)} />
      {label && (
        <div data-testid='loader-label' className='loader-label'>
          {label}
        </div>
      )}
    </div>
  </div>
);
