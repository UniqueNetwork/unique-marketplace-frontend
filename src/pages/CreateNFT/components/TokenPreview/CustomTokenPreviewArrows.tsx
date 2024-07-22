import React, { useEffect, useState } from 'react';

interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const CustomTokenPreviewArrowsNext: React.FC<ArrowProps> = (props) => {
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
        display: 'flex !important',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: '40px',
        width: '80px',
        height: '80px',
        transition: 'background-color 0.3s ease',
        border: '2px solid var(--color-primary-500)',
        boxShadow: isHovered
          ? '0px 3px 3px 0px #00000040'
          : '0px 2px 2px 0px #00000020',
        right: '-155px',
        ...style
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        style={{ margin: '23px 28px' }}
        width='26'
        height='33'
        viewBox='0 0 31 46'
        fill='none'
      >
        <path
          d='M4.25008 4.25L23 22.9999L4.25008 41.75'
          stroke='#009CF0'
          strokeWidth='2'
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
};

const CustomTokenPreviewArrowsPrev: React.FC<ArrowProps> = (props) => {
  const { className, style, onClick } = props;
  const [isHovered, setIsHovered] = useState(false);

  //react-slick not remove default arrow
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .slick-prev:before {
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
        backgroundColor: '#FFF',
        borderRadius: '45px',
        width: '80px',
        height: '80px',
        border: '2px solid var(--color-primary-500)',
        transition: 'background-color 0.3s ease',
        boxShadow: isHovered
          ? '0px 3px 3px 0px #00000040'
          : '0px 2px 2px 0px #00000020',
        zIndex: 222,
        left: '-155px',
        ...style
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        style={{ margin: '23px 25px' }}
        width='26'
        height='33'
        viewBox='0 0 31 46'
        fill='none'
      >
        <path
          d='M26.7499 4.25L8 22.9999L26.7499 41.75'
          stroke='#009CF0'
          strokeWidth='2'
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
};

export { CustomTokenPreviewArrowsNext, CustomTokenPreviewArrowsPrev };
