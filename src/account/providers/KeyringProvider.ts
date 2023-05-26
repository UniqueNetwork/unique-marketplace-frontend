import { KeyringPair, KeyringPair$Meta, KeyringPair$Json } from '@polkadot/keyring/types';
import { KeypairType } from '@polkadot/util-crypto/types';
import keyring from '@polkadot/ui-keyring';
import { accounts as accounts$ } from '@polkadot/ui-keyring/observable/accounts';
import { Account, Provider } from '@unique-nft/accounts/types';
import { KeyringLocalAccount, KeyringLocalOptions } from '@unique-nft/accounts/keyring-local';

export class KeyringLocalProvider extends Provider<KeyringPair> {
  private static initializedOptions: KeyringLocalOptions;

  private static initializer: Promise<void>;

  private static initialize(options: KeyringLocalOptions): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    if (KeyringLocalProvider.initializer) {
      const { initializedOptions } = KeyringLocalProvider;
      if (initializedOptions.type !== options.type) {
        throw new Error(
          'Cannot initialize a local provider more than once with different types'
        );
      }
      return KeyringLocalProvider.initializer;
    }
    KeyringLocalProvider.initializedOptions = options;

    return KeyringLocalProvider.initializer;
  }

  constructor(private readonly options: KeyringLocalOptions = {}) {
    super();
  }

  public override async init(): Promise<void> {
    await KeyringLocalProvider.initialize(this.options);

    accounts$.subject.subscribe((observedAccounts) => {
      const accounts = Object.values(observedAccounts).map((account) =>
        this.buildAccount(account.json.address)
      );

      this.emit('accountsChanged', accounts);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public addUri(
    suri: string,
    password?: string,
    meta?: KeyringPair$Meta,
    type?: KeypairType
  ): Account<KeyringPair> {
    const { pair } = keyring.addUri(suri, password, meta, type);
    return new KeyringLocalAccount(pair, this.options.passwordCallback);
  }

  private buildAccount(address: string | Uint8Array): Account<KeyringPair> {
    const pair = keyring.getPair(address);

    return new KeyringLocalAccount(pair, this.options.passwordCallback);
  }

  public override async getAccounts(): Promise<Account<KeyringPair>[]> {
    return Promise.resolve(keyring
      .getAccounts()
      .map((account) => this.buildAccount(account.address)));
  }

  // eslint-disable-next-line class-methods-use-this
  forgetAccount(account: Account<KeyringPair> | string): void {
    if (typeof account === 'string') {
      keyring.forgetAccount(account);
    } else {
      keyring.forgetAccount(account.address);
    }
  }

  public addPair(pair: KeyringPair, password: string): Account<KeyringPair> {
    const { pair: pairResult } = keyring.addPair(pair, password);
    return new KeyringLocalAccount(pairResult, this.options.passwordCallback);
  }

  public getPair(address: string | Uint8Array): Account<KeyringPair> {
    return this.buildAccount(address);
  }

  public createFromUri(
    suri: string,
    meta?: KeyringPair$Meta,
    type?: KeypairType
  ): Account<KeyringPair> {
    const pair = keyring.createFromUri(suri, meta, type);
    return new KeyringLocalAccount(pair, this.options.passwordCallback);
  }

  public addExternal(
    address: string | Uint8Array,
    meta?: KeyringPair$Meta
  ): Account<KeyringPair> {
    const { pair } = keyring.addExternal(address, meta);
    return new KeyringLocalAccount(pair, this.options.passwordCallback);
  }

  public createFromJson(
    json: KeyringPair$Json,
    meta?: KeyringPair$Meta
  ): Account<KeyringPair> {
    const pair = keyring.createFromJson(json, meta);
    return new KeyringLocalAccount(pair, this.options.passwordCallback);
  }
}
