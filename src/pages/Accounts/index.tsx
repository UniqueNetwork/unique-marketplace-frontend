/* eslint-disable react/jsx-no-bind */
import { useCallback, useState } from 'react';
import { Button, Tabs, InputText } from '@unique-nft/ui-kit';
import { encodeAddress, hdLedger, mnemonicGenerate, mnemonicValidate } from '@polkadot/util-crypto';
import keyring from '@polkadot/ui-keyring';
import { u8aToHex } from '@polkadot/util';
import { useApi } from '../../hooks/useApi';

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

// can be used to output generated address for seed
const addressFromSeed = (seed: string, derivePath: string, pairType: PairType): string => {
  return keyring
    .createFromUri(getSuri(seed, derivePath, pairType), {}, pairType === 'ed25519-ledger' ? 'ed25519' : pairType)
    .address;
};

// TODO: used for debug with transfers, irrelevant otherwise
const fromStringToBnString = (value: string, decimals: number): string => {
  if (!value || !value.length) {
    return '0';
  }

  const numStringValue = value.replace(',', '.');
  const [left, right] = numStringValue.split('.');
  const decimalsFromLessZeroString = right?.length || 0;
  const bigValue = [...(left || []), ...(right || [])].join('').replace(/^0+/, '');

  return (Number(bigValue) * Math.pow(10, decimals - decimalsFromLessZeroString)).toString();
};

export const AccountsPage = () => {
  const { rawRpcApi, rpcClient } = useApi();
  const [step, setStep] = useState<number>(0);
  const [password, setPassword] = useState<string>('12345');
  const [name, setName] = useState<string>('');
  const [seed, setSeed] = useState<string>(mnemonicGenerate());
  const [address, setAddress] = useState<string>();
  const generateSeed = useCallback(() => {
    const seed = mnemonicGenerate();
    setSeed(seed);
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

  const [importSeed, setImportSeed] = useState<string | number>();
  const [importPassword, setImportPassword] = useState<string | number>();
  const [importAddress, setImportAddress] = useState<string>();
  const onImportSeed = useCallback(() => {
    if (!importSeed || !importPassword || !mnemonicValidate(importSeed.toString())) return;
    const options = { genesisHash: rawRpcApi?.genesisHash.toString(), isHardware: false, name: name.trim(), tags: [] };
    const result = keyring.addUri(getSuri(importSeed?.toString(), derivePath, defaultPairType), importPassword?.toString(), options, defaultPairType);
    setImportAddress(result.pair.address);
  }, [importPassword, importSeed, rawRpcApi, name]);

  const onTest = useCallback(async () => {
    if (!rpcClient?.rawKusamaRpcApi) return;
    const amount = '1'; // KSM
    const address = '5GzuDzwLScZY15q9TQhvwYySA72RxPrsuYjcF37UyLNioJs4'; // send {amount} to self in order to test signing with keyring
    const signAccount = keyring.getPair(address);
    const tx = rpcClient.rawKusamaRpcApi?.tx.balances.transfer(
      encodeAddress(address),
      fromStringToBnString(amount, 12)
    );
    signAccount.unlock('12345');
    await tx.signAndSend(signAccount);
  }, [rpcClient]);
  return (
    <div>
      <InputText onChange={setImportSeed} value={importSeed} />
      <InputText onChange={setImportPassword} value={importPassword} />
      <Button title='Import seed' onClick={onImportSeed} />
      <Button title='SIGN TEST' onClick={onTest} />
      {importAddress}
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
