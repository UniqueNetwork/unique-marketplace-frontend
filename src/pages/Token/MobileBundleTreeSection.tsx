import React, { ReactElement } from 'react';
import { Button } from 'components/UI';
import styled from 'styled-components';
import { AdditionalLight } from '../../styles/colors';

interface IProps {
  isVisible: boolean
  openView(): void
  closeView(): void
  bundleTreeComponent: ReactElement
}

function MobileBundleTreeSection({ bundleTreeComponent, isVisible, openView, closeView }: IProps) {
  return (
    <MobileTreeViewButtons>
      {!isVisible && <Button
        onClick={openView}
        title={'Show bundle tree structure'}
        role={'primary'}
      />}
      {isVisible && <Button
        onClick={closeView}
        title={'Back'}
        role={'primary'}
        iconLeft={{ name: 'arrow-left', size: 16, color: AdditionalLight }}
      />}
      <MobileFilterModal isVisible={isVisible}>
        {isVisible && bundleTreeComponent}
      </MobileFilterModal>
    </MobileTreeViewButtons>
  );
}

const MobileTreeViewButtons = styled.div`
  display: none;
  position: fixed;
  top: calc(100% - 60px);   
  right: 0;
  left: 0;
  padding: 10px var(--gap);
  background-color: ${AdditionalLight};
  box-shadow: 0px -8px 12px rgba(0, 0, 0, 0.06);
  z-index: 8;
  column-gap: calc(var(--gap) / 2);

  @media (max-width: 567px) {
    display: flex;
    button {
      flex-grow: 1;
    }
  }
`;

const MobileFilterModal = styled.div<{ isVisible: boolean }>`
  display: none;
  position: fixed;
  background-color: ${AdditionalLight};
  padding: calc(var(--gap) * 1.5);
  height: calc(100% - 184px);
  top: 80px;
  right: 0;
  left: 0;
  overflow-y: scroll;
  z-index: 2;

  //& div[class^=Filters] {
  //  width: 100%;
  //  padding-bottom: 60px;
  //}
  //
  //& div[class^=CollectionsFilter__CollectionFilterWrapper] {
  //  max-height: unset;
  //  div[class^=CollectionsFilter__AttributeWrapper]:last-child {
  //    padding-bottom: 90px;
  //  }
  //}
  
  @media (max-width: 567px) {
    display: ${({ isVisible }) => isVisible ? 'block' : 'none'};
  }
`;

export default MobileBundleTreeSection;
