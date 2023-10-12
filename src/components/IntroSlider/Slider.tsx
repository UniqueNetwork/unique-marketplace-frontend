import { Modal } from 'components/UI';
import React, { Dispatch, SetStateAction, useState } from 'react';
import styled from 'styled-components';

export type SliderProps = {
  open: boolean
  onClose(): void
  activeSlide?: number;
  children:
    | (({
        activeSlide,
        setActiveSlide,
        onClose
      }: {
        activeSlide: number;
        setActiveSlide: Dispatch<SetStateAction<number>>;
        onClose(): void;
      }) => JSX.Element)
    | (JSX.Element[] | JSX.Element);
};

export const Slider = ({ open, onClose, activeSlide = 0, children }: SliderProps) => {
  const [active, setActive] = useState(activeSlide);

  const renderContent = () => {
    if (typeof children === 'function') {
      const content = children({
        activeSlide,
        setActiveSlide: setActive,
        onClose
      }).props.children;
      return Array.isArray(content) ? content : [content];
    }
    return Array.isArray(children) ? children : [children];
  };

  return (
    <Modal
      align='top'
      isVisible={open}
      onClose={onClose}
      isClosable
    >
      <ContentWrapper>
        <div>{renderContent()[active]}</div>
        <Dots>
          {renderContent().map((_, idx) => (
            <Dot isActive={active === idx} key={idx} onClick={() => setActive(idx)} />
          ))}
        </Dots>
      </ContentWrapper>
    </Modal>
  );
};

const ContentWrapper = styled.div`
  min-height: 308px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 0;
  &>div {
    width: 100%;
  }
`;

const Dots = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 25px;
  padding-bottom: 5px;
`;

const Dot = styled.div<{ isActive: boolean }>`
  cursor: pointer;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ isActive }) =>
    isActive ? 'var(--color-primary-300)' : 'var(--color-primary-200)'};

  & + & {
    margin-left: 10px;
  }
`;
