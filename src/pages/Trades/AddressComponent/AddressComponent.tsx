import React, { useMemo } from 'react';
import { shortcutText } from '../../../utils/textUtils';
import { Link } from '@unique-nft/ui-kit';
import config from '../../../config';
import styled from 'styled-components/macro';

export const AddressComponent = ({ text }: { text: string }) => {
  const shortCut = useMemo(() => (shortcutText(text)), [text]);
  return <LinkWrapper><Link
    href={`${config?.scanUrl || ''}account//${text}`}
    title={shortCut}
  /></LinkWrapper>;
};

const LinkWrapper = styled.span`
  .unique-link {
    font-size: 16px;
  }
`;
