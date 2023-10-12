import IconWithHint from 'components/IconWithHint/IconWithHint';
import styled from 'styled-components';

export const FormWrapper = styled.div`
  margin: calc(var(--gap) * 2.5) 0;
`;

export const FormRow = styled.div`
  max-width: 756px;
  padding-bottom: calc(var(--gap) * 1.5);
  
  & > div {
    width: 100%;
  }
  
  @media (max-width: 576px) {
    padding-bottom: calc(var(--gap));
  }
`;

export const ButtonsRow = styled.div`
  margin-top: var(--gap);
  display: flex;
  justify-content: space-between;
`;

export const LabelWrapper = styled.div`
  display: flex;
  gap: calc(var(--gap) / 2);
  align-items: center;
  div {
    height: 24px;
  }
`;

export const RadioLabel = ({ label, tooltip }: { label: string, tooltip: string }) => (
  <LabelWrapper>{label}<IconWithHint align={{ appearance: 'horizontal', vertical: 'top', horizontal: 'right' }}>
    <span>{tooltip}</span>
  </IconWithHint></LabelWrapper>
);
