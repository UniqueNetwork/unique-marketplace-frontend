import React from 'react';
import styled from 'styled-components/macro';
import { PagePaper } from '../../components/PagePaper/PagePaper';
import Accordion from '../../components/Accordion/Accordion';

const Faq = (): React.ReactElement<void> => {
  return (<PagePaper>
    <MainWrapper>
      <p>Sādu is a play to earn mobile app for natural capital. Eco-conscious habits can feel pointless. Investing in the carbon market is complicated. Reduce your impact and gain access to the market for carbon removal by collecting eco-friendly NFTs.</p>
      <p > Download the app, subscribe, or play your favourite sport to earn trees monthly. Every tree guarantees funding to an ecosystem restoration project. The more trees you earn the more NFTs you win.</p>
      <p >As a platform for digital assets with a positive environmental impact Sādu will release the first batch of NFTs on a marketplace that prioritizes the planet. Funding from the sale of every digital asset will be allocated to participating Sustainability Partners, a digital artist, and Sādu. Participating Sustainability Partners, include <a href='https://sea-trees.org/pages/about' target='_blank' rel='noreferrer'>SeaTrees</a>, <a href='https://www.thehaititreeproject.org/' target='_blank' rel='noreferrer'>The Haiti Tree Project</a>, and <a href='http://re-climate.com/en' target='_blank' rel='noreferrer'>Re-Climate 🇺🇦</a>. They each take their own approach to restoring kelp forests, deforestation recovery, and regenerative agroforestry.</p>
      <p >The artists contributing work to this collection, <a href='https://www.instagram.com/bondtruluv/?hl=en' target='_blank' rel='noreferrer'>Bond Truluv</a> and <a href='https://www.instagram.com/whosthereplease/' target='_blank' rel='noreferrer'>Stacie Ant</a> bring awareness to the emotional dichotomy between self-preservation, technological advancement and an innate longing to preserve the natural ecosystem. Additionally, the work of Stacie Ant implements generative artificial intelligence to make each piece truly unique for this genesis collection.</p>
      <p >This batch of NFTs is a pre-release for Polkadot Kusama. A total of 1000 NFTs will be released on multiple blockchain networks. This marketplace was built in partnership with Sovereign Nature Initiative (SNI) and Unique Network. SNI will also receive a 5% commission on every NFT, which they will use towards their sustainability commitments.</p>
      <div className='faq'>
        <h2 className='subtitle'>Frequently Asked Questions</h2>
        <Accordion title={'I connected the right wallet to the app but it shows that my NFTree belongs to a different address. Why?'}>
          <div className='accordion-body'>
            <p>Substrate account addresses (Polkadot, Kusama etc.) may look different on different networks but they have all the same private key underneath. You can see all transformations of any address on <a href='https://polkadot.subscan.io/tools/ss58_transform' target='_blank' rel='noreferrer'>https://polkadot.subscan.io/tools/ss58_transform</a></p>
          </div>
        </Accordion>
        <Accordion title={'I see my NTF on the My Gallery page twice and one of them is “on hold”'}>
          <div className='accordion-body'>
            <p>It can happen if the previous version of the market had information about an unfinished listing. In that case: (1) Go to the page of ‘on hold’ token and complete listing. (2) Then delist this token.</p>
          </div>
        </Accordion>
        <Accordion title={'I see the error “1010: Invalid Transaction: Inability to pay some fees, e.g. account balance too low”'}>
          <div className='accordion-body'>
            <p>Just wait for half a minute and try again.</p>
          </div>
        </Accordion>
        <Accordion title={'Whom can I contact if I have questions regarding the marketplace?'}>
          <div className='accordion-body'>
            <p>Please contact <a href='mailto:info@sadu.io'>info@sadu.io</a> if you have any questions.</p>
          </div>
        </Accordion>
      </div>
    </MainWrapper>
  </PagePaper>);
};

const MainWrapper = styled.div`
  display: block !important;
  padding: 4rem;

  .faq {
    width: 100%;
  }

  .subtitle {
    margin: calc(2rem - 0.14285714em) 0 1rem;
    font-size: 40px;
    text-transform: uppercase;
    font-weight: 500;
    color: var(--color-additional-light);
    font-family: var(--font-heading);
    text-align: center;
  }

  .accordion-item {
    background-color: transparent;
    color: #var(--color-additional-light);
    border: 1px solid var(--color-additional-light);
    border-right: none;
    border-left: none;
    padding: 20px 12px;

    display: flex;
    align-items: center;
    text-align: left;
    position: relative;
    width: 100%;
    padding: 1rem 1.25rem;
  }

  .accordion-title {
    display: flex;
    width: 100%;
    svg {
      position: absolute;
      right: 24px
    }
    span {
      background-color: transparent;
        color: #var(--color-additional-light);
        font-size: 20px;
    }
  }

  .accordion-body {
    padding: 24px;
    font-size: 16px;
    width: 100%;
    p {
      padding: 16px;
    }
    a {
      display: inline-block;
      position: relative;
      font-size: 16px !important;
      text-decoration: none;
      color: #c5ffe5;

      &:after {
        content: '';
        position: absolute;
        width: 100%;
        transform: scaleX(0);
        height: 2px;
        bottom: 0;
        left: 0;
        background-color: #c5ffe5;
        transform-origin: bottom right;
        transition: transform 0.3s ease-out;
      }
      &:hover {
        &:after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
      }
    }
  }

  h4:not(:first-child) {
    margin-top: calc(var(--gap) * 2);
  }
  
  a {
    color: var(--color-additional-light);
    font-weight: 600;
    text-decoration: underline;
    transition: letter-spacing .2s;
    &:hover {
      cursor: pointer;
      color: var(--color-primary-500);
      letter-spacing: 1.5px;
    }
  }
  
  p, ol li {
    color: var(--color-additional-light);
    font-size: 16px;
    line-height: 2;
    font-family: var(--font-roboto);
    word-spacing: 4px
    letter-spacing: normal;
  }

  ol {
    padding-left: 17px;
  }
`;

export default Faq;

// export default React.memo(Faq);
