import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';

import { Attribute, AttributeOption, NewToken } from '../types';
import { AttributesForm, LabelText } from './AttributesForm';
import { TokenBasicCard } from './TokenBasicCard';
import { FormGrid } from './TokenCard';
import { Button, InputAmount, Modal, Heading } from 'components/UI';
import { ModalFooter } from './ModalFooter';
import { PotentialAttribute } from '@unique-nft/sdk';
import { RoyaltiesForm } from 'pages/CollectionEdit/Forms/RoyaltiesForm';
import { Royalty } from '../../CollectionEdit/types';

interface AttribytesModalProps {
  tokens: NewToken[];
  tokenPrefix: string;
  attributesSchema: PotentialAttribute[] | undefined;
  onChange(tokens: NewToken[]): void;
  onClose(): void;
  mode?: 'NFT' | 'ReFungible' | 'Fungible';
  schemaVersion: string;
}

export const AttributesModal = ({
  tokens,
  tokenPrefix,
  attributesSchema,
  onChange,
  onClose,
  mode,
  schemaVersion
}: AttribytesModalProps) => {
  const [summaryAttributes, setSummaryAttributes] = useState<Attribute[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [totalFractions, setTotalFractions] = useState<Attribute>();
  const [royalties, setRoyalties] = useState<Royalty[]>();
  const hasDuplicateAddresses = useMemo(() => {
    if (!royalties) return false;
    const addresses = royalties.map((item) => item.address);
    const uniqueAddresses = new Set(addresses);
    return addresses.length !== uniqueAddresses.size;
  }, [royalties]);

  const totalRoyaltyLessThen99 = useMemo(() => Number(royalties && royalties.reduce((acc, { value }) => Number(acc) + Number(value), 0)) < 99, [royalties]);

  const onChangeAttributes = (attributes: Attribute[]) => {
    setAttributes(attributes);
  };

  const onSubmit = () => {
    onChange(
      tokens.map((token) => ({
        ...token,
        attributes: attributes.map((attribute, index) => {
          if ((attribute as { hasDifferentValues: boolean })?.hasDifferentValues) {
            return token.attributes[index];
          }
          return attribute;
        }),
        royalties: royalties || [],
        ...(mode === 'ReFungible'
          ? {
              totalFractions: (totalFractions as { hasDifferentValues: boolean })
                .hasDifferentValues
                ? token.totalFractions
                : (totalFractions as string)
            }
          : {})
      }))
    );
    onClose();
  };

  const hasDifferentRoyalties = useMemo(() => {
    if (tokens.length === 0) return false;
    const firstRoyalties = JSON.stringify(tokens[0].royalties);
    for (let i = 1; i < tokens.length; i++) {
      if (JSON.stringify(tokens[i].royalties) !== firstRoyalties) return true;
    }
    return false;
  }, [tokens]);

  useEffect(() => {
    const summaryAttributes = (attributesSchema || []).map(
      ({ trait_type, values }, index) => {
        let attribute: Attribute;
        const isDifferent = tokens.some(({ attributes }, tokenIndex) => {
          if (tokenIndex === 0) {
            attribute = attributes[index];
            return false;
          }
          if (values) {
            return { hasDifferentValues: true };
          }
          if (values) {
            return (
              (attributes[index] as AttributeOption)?.id !==
              (attribute as AttributeOption)?.id
            );
          }
          return attributes[index] !== attribute;
        });
        if (isDifferent) {
          return { hasDifferentValues: true };
        }
        return attribute;
      }
    );
    if (tokens[0]?.royalties && Array.isArray(tokens[0]?.royalties) && !hasDifferentRoyalties) {
      setRoyalties(tokens[0]?.royalties);
    }
    setAttributes(summaryAttributes);
    setSummaryAttributes(summaryAttributes);
    if (mode === 'ReFungible') {
      let totalFractionsValue: Attribute;
      const isDifferent = tokens.some(({ totalFractions }, tokenIndex) => {
        if (tokenIndex === 0) {
          totalFractionsValue = totalFractions;
          return false;
        }
        return totalFractionsValue !== totalFractions;
      });
      setTotalFractions(isDifferent ? { hasDifferentValues: true } : totalFractions);
    }
  }, []);

  // if (!attributesSchema) {
  //   return null;
  // }

  return (
    <ModalStyled isVisible={true} onClose={onClose}>
      <Heading>Changing of {tokens.length} tokens</Heading>
      <ModalContent>
        <TokensImages className='slide-container'>
          <Slide autoplay={false} transitionDuration={150}>
            {tokens.map((token) => {
              return (
                <TokenBasicCard
                  key={token.id}
                  token={token}
                  tokenPrefix={tokenPrefix}
                />
              );
            })}
          </Slide>
        </TokensImages>
        <FormWrapper>
          <FormGrid>
            {mode === 'ReFungible' && (
              <>
                <LabelText>Total fractions</LabelText>
                <InputAmount
                  label=''
                  value={
                    (totalFractions as { hasDifferentValues: boolean })
                      .hasDifferentValues
                      ? ''
                      : (totalFractions as string)
                  }
                  maxValue={1_000_000_000}
                  onChange={setTotalFractions}
                />
              </>
            )}
            <AttributesForm
              initialAttributes={summaryAttributes}
              attributes={attributes}
              attributesSchema={attributesSchema || []}
              onChange={onChangeAttributes}
            />
          </FormGrid>
          {schemaVersion !== '1.0.0' && (
            <RoyaltiesForm
              initialFormData={royalties || []}
              onSubmit={(data) => setRoyalties(data.royalties)}
              withSaveButton={false}
              hasDifferentRoyalties={hasDifferentRoyalties}
              hasDuplicateAddresses={hasDuplicateAddresses}
            />
          )}
        </FormWrapper>
      </ModalContent>
      <ModalFooter>
        <Button role='outlined' title='Cancel' onClick={onClose} />
        <Button
          role='primary'
          title='Submit'
          onClick={onSubmit}
          disabled={hasDuplicateAddresses || !totalRoyaltyLessThen99}
        />
      </ModalFooter>
    </ModalStyled>
  );
};

const ModalStyled = styled(Modal)`
  .unique-modal-content-wrapper {
    width: 90%;
  }
`;

export const ModalContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--prop-gap);
  min-width: 800px;
  @media (max-width: 1024px) {
    min-width: 600px;
  }
  @media screen and (max-width: 768px) {
    flex-direction: column;
    min-width: calc(100vw - 64px);
  }
`;

export const TokensImages = styled.div`
  display: flex;
  .react-slideshow-container {
    width: 250px;
  }
  .each-slide-effect > div {
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: cover;
    height: 350px;
  }

  .each-slide-effect span {
    padding: 20px;
    font-size: 20px;
    background: #efefef;
    text-align: center;
  }

  .default-nav:last-of-type {
    right: 4px;
  }
  .default-nav:first-of-type {
    left: 4px;
  }
  @media screen and (max-width: 568px) {
    justify-content: center;
  }
`;

const FormWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;
