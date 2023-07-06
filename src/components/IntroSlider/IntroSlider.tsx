import { ConnectedAccountTypesKey } from 'account/AccountProvider';
import { useEffect, useState } from 'react';
import { IntroCard } from './IntroCard';
import { Slider } from './Slider';
import confetti from 'static/images/confetti.svg';
import sparkles from 'static/images/sparkles.svg';
import fox from 'static/images/fox.svg';
import wallet from 'static/images/wallet.svg';
import bundle from 'static/images/bundle.svg';

const BUNDLE_SHOW_MODAL = 'new-market-intro-show-modal';

const getConnectedWallets = localStorage.getItem(ConnectedAccountTypesKey);

export const IntroSlider = () => {
  const [open, setOpen] = useState(() => {
    if (!getConnectedWallets || getConnectedWallets.split(';').length === 0) {
      return false;
    }

    const status = localStorage.getItem(BUNDLE_SHOW_MODAL);
    return status ? JSON.parse(status) : true;
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    localStorage.setItem(BUNDLE_SHOW_MODAL, JSON.stringify(false));
  }, [open]);

  useEffect(() => {
    const status = localStorage.getItem(BUNDLE_SHOW_MODAL);
    if ((status !== null && !JSON.parse(status))) {
      return;
    }
    setOpen(true);
  }, []);

  return <Slider open={open} onClose={() => setOpen(false)}>
    {({ setActiveSlide, onClose }) => {
    return (
      <>
        <IntroCard
          title='New Multichain Marketplace is live!'
          description={<>Sell tokens on Unique and Quartz</>}
          imgPath={confetti}
          setActiveSlide={setActiveSlide}
        />
        <IntroCard
          title='All NFTs are welcome'
          description={
            <>Our marketplace accepts all NFT sales</>
          }
          imgPath={sparkles}
          setActiveSlide={setActiveSlide}
        />
        <IntroCard
          title='Nested NFTs'
          description={
            <>
              Create on-chain connections between tokens and start selling your first NFT bundles
            </>
          }
          imgPath={bundle}
          setActiveSlide={setActiveSlide}
          onCloseModal={onClose}
        />
        <IntroCard
          title='MetaMask support'
          description={
            <>
              Sell, buy and list tokens with your MetaMask wallet
            </>
          }
          imgPath={fox}
          setActiveSlide={setActiveSlide}
          onCloseModal={onClose}
        />
        <IntroCard
          title='Self-Custody'
          description={
            <>
              Total control of your assets
            </>
          }
          imgPath={wallet}
          setActiveSlide={setActiveSlide}
          isLast={true}
          onCloseModal={onClose}
        />
      </>
    );
  }}
  </Slider>;
};
