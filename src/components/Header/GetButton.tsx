import { Button } from 'components/UI';
import { useApi } from 'hooks/useApi';
import styled from 'styled-components';

const onGetClick = (token: string) => () => {
  switch (token) {
    case 'OPL':
      window.open('https://t.me/unique2faucet_opal_bot', '_blank', 'noopener');
      break;
    case 'QTZ':
      window.open('https://www.mexc.com/exchange/QTZ_USDT', '_blank', 'noopener');
      break;
    case 'UNQ':
      window.open('https://www.huobi.com/en-us/exchange/unq_usdt', '_blank', 'noopener');
      break;
    default:
      break;
  }
};

export const GetButton = () => {
  const { chainProperties } = useApi();

  if (!chainProperties) return null;

  return <StyledButton
    role='primary'
    onClick={onGetClick(chainProperties.token)}
    title={`Get ${chainProperties.token}`}
  />;
};

const StyledButton = styled(Button)`
  /* color: var(--color-additional-light) !important; */
  /* background-color: #2DBF15 !important;
  border-color: #2DBF15 !important; */
  @media (max-width: 420px) {
    display: none;
  }
`;
