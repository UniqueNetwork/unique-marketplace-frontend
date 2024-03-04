import styled from 'styled-components';

export const ContentRow = styled.div.attrs((props: { space?: string }) => ({
  space: props.space ?? 'calc(var(--prop-gap) * 2)'
}))`
  display: flex;
  flex-direction: column;
  margin-bottom: ${(props) => props.space};

  .unique-input-text {
    width: 100%;
  }
`;
