/* eslint-disable react/jsx-no-bind */
import { useCallback, useState } from 'react';
import { Button, Heading, Tabs, Text, Select, InputText } from '@unique-nft/ui-kit';
import { hdLedger, hdValidatePath, keyExtractSuri, mnemonicGenerate, mnemonicValidate, randomAsU8a } from '@polkadot/util-crypto';
import keyring from '@polkadot/ui-keyring';
import { u8aToHex } from '@polkadot/util';
import { useApi } from '../../hooks/useApi';

/*
General TODO LIST:
1. Create seed + address + password (keyrig to localStorage)
2. Import seed -> keyrig to localStorage
*/

type PairType = 'ecdsa' | 'ed25519' | 'ed25519-ledger' | 'ethereum' | 'sr25519';

const derivePath = '';
const defaultPairType = 'sr25519';

const getSuri = (seed: string, derivePath: string, pairType: PairType): string => {
  return pairType === 'ed25519-ledger'
    ? u8aToHex(hdLedger(seed, derivePath).secretKey.slice(0, 32))
    : pairType === 'ethereum'
      ? `${seed}/${derivePath}`
      : `${seed}${derivePath}`;
};

const addressFromSeed = (seed: string, derivePath: string, pairType: PairType): string => {
  return keyring
    .createFromUri(getSuri(seed, derivePath, pairType), {}, pairType === 'ed25519-ledger' ? 'ed25519' : pairType)
    .address;
};
export const AccountsPage = () => {
  const { rawRpcApi } = useApi();
  const [step, setStep] = useState<number>(0);
  const [password, setPassword] = useState<string>('12345');
  const [name, setName] = useState<string>('');
  const [seed, setSeed] = useState<string>(mnemonicGenerate());
  const [address, setAddress] = useState<string>();
  const generateSeed = useCallback(() => {
    const seed = mnemonicGenerate();
    setSeed(seed);
    // setAddress(addressFromSeed(seed, derivePath, defaultPairType));
  }, [setSeed]);

  // save account to localStorage
  const onFinish = useCallback(() => {
    const options = { genesisHash: rawRpcApi?.genesisHash.toString(), isHardware: false, name: name.trim(), tags: [] };
    const result = keyring.addUri(getSuri(seed, derivePath, defaultPairType), password, options, defaultPairType);
    const { address } = result.pair;
    setAddress(address);
  }, [setAddress, name, password, rawRpcApi, seed]);

  const SeedComponent = (<>
    <span>{seed}</span>
    <Button onClick={generateSeed} title='Regenerate seed' />
  </>);
  const PasswordComponent = (<>
    <span>Create a password</span>
    <InputText value={password} onChange={(value: string) => setPassword(value)}/>
  </>);
  const FinalComponent = (
    <>
      <Button onClick={onFinish} title='Finish'/>
      {address}
    </>);

  return (
    <div>
      <Tabs
        activeIndex={step}
        labels={['Seed', 'Password', 'Final']}
        onClick={(index: number) => (setStep(index))}
      />
      <Tabs activeIndex={step}>
        {SeedComponent}
        {PasswordComponent}
        {FinalComponent}
      </Tabs>
    </div>
  );
};
