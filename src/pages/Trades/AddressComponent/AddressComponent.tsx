import React, { useMemo } from 'react';
import { shortcutText } from '../../../utils/textUtils';
import { Text } from '@unique-nft/ui-kit';

export const AddressComponent = ({ text }: { text: string }) => {
  const shortCut = useMemo(() => (shortcutText(text)), [text]);
  return <Text>{shortCut}</Text>;
};
