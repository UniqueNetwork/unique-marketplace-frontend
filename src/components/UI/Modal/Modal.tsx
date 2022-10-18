import { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { Icon } from '../Icon/Icon';

export interface ModalProps {
    children: ReactNode;
    isVisible: boolean;
    isClosable?: boolean;
    isGlobalBackdrop?: boolean
    onClose?(): void;
}

export const Modal = ({
    children,
    isVisible,
    isClosable,
    isGlobalBackdrop,
    onClose
}: ModalProps) => {
    const [clickCoords, setClickCoords] = useState({ pageX: -1, pageY: -1 });
    return isVisible
? (
  <ModalWrapper
    isGlobalBackdrop={isGlobalBackdrop}
    onMouseDown={(event) => {
                const { pageX, pageY } = event;
                setClickCoords({ pageX, pageY });
            }}
    onClick={(event) => {
                const { pageX, pageY } = event;
                if (
                    pageX === clickCoords.pageX &&
                    pageY === clickCoords.pageY &&
                    event.target === event.currentTarget &&
                    isClosable
                ) {
                    onClose!();
                }
            }}
  >
    <div className='unique-modal'>
      {isClosable && (
      <div className='close-button' onClick={onClose}>
        <Icon name={'close'} size={16} />
      </div>
      )}
      {children}
    </div>
  </ModalWrapper>
    )
: null;
};

const ModalWrapper = styled.div<{ isGlobalBackdrop?: boolean }>`
  font-family: var(--prop-font-family);
  font-size: var(--prop-font-size);
  font-weight: var(--prop-font-weight);
  font-style: normal;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: ${({ isGlobalBackdrop }) => isGlobalBackdrop ? 1000 : 50};
  display: flex;
  justify-content: center;
  overflow-y: auto;
  align-items: center;
  flex-flow: wrap;
  padding: calc(var(--prop-gap) * 5) 0;

  .unique-modal {
    position: relative;
    width: calc(640px - var(--prop-gap) * 3);
    background-color: var(--color-additional-light);
    border-radius: 8px;
    padding: calc(var(--prop-gap) * 1.5);
    min-height: 40px;

    .unique-font-heading {
      width: calc(100% - 44px);
    }

    .close-button {
      position: absolute;
      cursor: pointer;
      padding: 10px;
      top: 28px;
      right: 19px;

      svg {
          fill: var(--color-additional-dark);
      }
    }
  }
`;
