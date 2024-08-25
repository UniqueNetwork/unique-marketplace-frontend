import React, { useEffect, useState } from 'react';
import { Grey200, Grey300 } from 'styles/colors';

interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const CustomNextArrow: React.FCC<ArrowProps> = (props) => {
  const { className, style, onClick } = props;
  const [isHovered, setIsHovered] = useState(false);

  //react-slick not remove default arrow
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .slick-next:before {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        ...style,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isHovered ? Grey200 : Grey300,
        borderRadius: '12px',
        width: '24px',
        height: '24px',
        transition: 'background-color 0.3s ease'
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        width='8'
        height='12'
        style={{ marginLeft: 1 }}
        viewBox='0 0 8 12'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M1 1L5.99998 5.99998L1 11'
          stroke='white'
          strokeWidth='2'
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
};

const CustomPrevArrow: React.FCC<ArrowProps> = (props) => {
  const { className, style, onClick } = props;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={className}
      style={{
        ...style,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isHovered ? Grey200 : Grey300,
        borderRadius: '12px',
        width: '24px',
        height: '24px',
        transition: 'background-color 0.3s ease'
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        width='8'
        height='12'
        style={{ marginRight: 1 }}
        viewBox='0 0 8 12'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M7 1L2.00002 5.99998L7 11'
          stroke='white'
          strokeWidth='2'
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
};

export { CustomNextArrow, CustomPrevArrow };
