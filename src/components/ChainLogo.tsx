import React, { useMemo } from 'react';
import { chainLogos, emptyLogos, namedLogos, nodeLogos } from '../logos';
import { useApi } from '../hooks/useApi';

interface Props {
  className?: string
  isInline?: boolean
  logo?: keyof typeof namedLogos
  onClick?: () => any
  withoutHl?: boolean
  size?: number
}

function sanitize(value?: string): string {
  return value?.toLowerCase().replace('-', ' ') || '';
}

const nameByPrefix: Record<number, any> = {
  7391: 'Unique',
  255: 'QUARTZ by UNIQUE',
  42: 'OPAL by UNIQUE'
};

function ChainLogo({
 className = '',
  isInline,
  logo,
  onClick,
  withoutHl,
  size = 32
}: Props): React.ReactElement<Props> {
  const { chainData } = useApi();

  const [isEmpty, img] = useMemo((): [boolean, string] => {
    const found = logo
      ? namedLogos[logo]
      : chainLogos[sanitize(nameByPrefix[chainData?.SS58Prefix || 42])];

    return [!found || logo === 'empty', (found || emptyLogos.empty) as string];
  }, [logo, chainData?.SS58Prefix]);

  return (
    <img
      alt='chain logo'
      className={`chain-logo ${className}${isEmpty && !withoutHl ? ' highlight--bg' : ''}${isInline ? ' isInline' : ''
        }`}
      onClick={onClick}
      src={img}
      height={size}
    />
  );
}

export default React.memo(ChainLogo);
