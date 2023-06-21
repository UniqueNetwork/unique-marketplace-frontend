import { ConnectedAccountTypesKey } from 'account/AccountProvider';
import { useAccounts } from 'hooks/useAccounts';
import { useEffect, useState } from 'react';
import { IntroCard } from './IntroCard';
import { Slider } from './Slider';
import confetti from 'static/images/confetti.svg';
import sparkles from 'static/images/sparkles.svg';
import puzzle from 'static/images/puzzle.svg';
import fox from 'static/images/fox.svg';
import wallet from 'static/images/wallet.svg';

const BUNDLE_SHOW_MODAL = 'new-market-bundle-show-modal';

const getConnectedWallets = localStorage.getItem(ConnectedAccountTypesKey);

export const IntroSlider = () => {
  const { selectedAccount } = useAccounts();
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
    if (!selectedAccount || (status !== null && !JSON.parse(status))) {
      return;
    }
    setOpen(true);
  }, [selectedAccount]);

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
          title='Customizable NFTs'
          description={
            <>
              Buy your first customizable NFTs and upgrade using unique wearables
            </>
          }
          imgPath={puzzle}
          setActiveSlide={setActiveSlide}
          onCloseModal={onClose}
        />
        <IntroCard
          title='Metamask support'
          description={
            <>
              Sell, buy and list tokens with your Metamask wallet
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
