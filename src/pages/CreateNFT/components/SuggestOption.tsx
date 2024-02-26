import styled from 'styled-components';

export const SuggestOption = styled.div`
  &.suggestion-item {
    display: flex;
    align-items: center;
    gap: calc(var(--prop-gap) / 2);

    & > img {
      flex: 0 0 auto;
      object-fit: cover;
    }

    .suggestion-item {
      &__title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
`;
