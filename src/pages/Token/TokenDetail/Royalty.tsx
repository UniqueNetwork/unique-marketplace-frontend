import IconWithHint from 'components/IconWithHint/IconWithHint';
import styled from 'styled-components';
import { Text } from 'components/UI';

type RoyaltyProps = {
  value?: number
  title?: string
}

export const RoyaltyValue = ({ value, title = 'Royalty' }: RoyaltyProps) => {
  if (!value) return null;

  return <RoyaltyWrapper>
    <RoyaltyText size='m' color='grey-500'>{`${title}: ${value * 100}%`}</RoyaltyText>
    <IconWithHint align={{ appearance: 'horizontal', horizontal: 'right', vertical: 'middle' }}>
      Royalty is&nbsp;a&nbsp;fee that will be&nbsp;applied when purchasing a&nbsp;token. This royalty is&nbsp;a&nbsp;percentage of&nbsp;the sale price that goes to&nbsp;the owner, creator, or&nbsp;sponsor of&nbsp;the collection. The royalty rate can be&nbsp;set or&nbsp;changed by&nbsp;the collection owner or&nbsp;the owner of&nbsp;a&nbsp;specific token (advanced feature). You can find the current royalty rate for the collection on&nbsp;the collection&apos;s page.
    </IconWithHint>
  </RoyaltyWrapper>;
};

const RoyaltyWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: var(--gap);  
  gap: calc(var(--gap) / 2); 
`;

const RoyaltyText = styled(Text)`
`;
