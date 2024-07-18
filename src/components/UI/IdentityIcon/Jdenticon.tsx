import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { update } from 'jdenticon';

interface JdenticonProps {
  value: string;
  size?: string;
}

const Jdenticon: React.FC<JdenticonProps> = ({
  value = 'test',
  size = '100%'
}) => {
  const icon = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof update === 'function') {
      if (icon.current) {
        update(icon.current, value);
      }
    } else {
      console.error(
        'jdenticon is not defined or does not have an update method'
      );
    }
  }, [value]);

  return (
    <svg
      data-jdenticon-value={value}
      height={size}
      ref={icon}
      width={size} 
    />
  );
};

Jdenticon.propTypes = {
  size: PropTypes.string,
  value: PropTypes.string.isRequired
};

export default Jdenticon;
