import Web3 from 'web3';
import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { addressToEvm } from '@polkadot/util-crypto';
import { sleep } from '../../../utils/helpers';
import { IMarketController, TransactionOptions } from '../types';

class MarketController implements IMarketController {
  private api: ApiPromise;
  private kusamaApi: ApiPromise;
  private contractAddress = ''; // TODO: from config/BE

  constructor(api: ApiPromise, kusamaApi: ApiPromise) {
    this.api = api;
    this.kusamaApi = kusamaApi;
  }

   // decimals: 15 - opal, 18 - eth
   private subToEthLowercase (eth: string): string { // TODO: why args called eth!?
    const bytes = addressToEvm(eth);

    return '0x' + Buffer.from(bytes).toString('hex');
  }

  private getEthAccount(account: string) {
    if (!account) throw new Error('Account was not provided');
    const ethAccount = Web3.utils.toChecksumAddress(this.subToEthLowercase(account));
    return ethAccount.toLowerCase();
  }

  public async checkWhiteListed(account: string): Promise<boolean> {
    const ethAddress = this.getEthAccount(account);
    try {
      return (await this.api.query.evmContractHelpers.allowlist(this.contractAddress, ethAddress)).toJSON() as boolean;
    } catch (e) {
      console.error('Check for whitelist failed', e);
      throw e;
    }
  }

  private TransferMinDeposit = (recipient: string, value: BN) => {
      return this.kusamaApi.tx.balances.transfer(recipient, value); // TODO: transaction for sign
  }

  public async addToWhiteList(account: string, options: TransactionOptions): Promise<void> {
    const ethAddress = this.getEthAccount(account);
    const isWhiteListed = await this.checkWhiteListed(ethAddress);
    if (isWhiteListed) {
      return;
    }
    // TODO: can't find account details for min deposit transfer, assuming it is taken from transaction
    const hasMintDeposit = this.kusamaApi?.consts.balances?.existentialDeposit;
    if (!hasMintDeposit) {
      // await options.sign(this.TransferMinDeposit());
      // await whiteListing before returning "done"
      /*
        let attempt = 0;
        const attemptLimit = 5;
        while(attempt < attemptLimit) {
          sleep((attemptLimit - attempt) * 1000) // wait 1sec less between attempts
          if (this.checkWhiteListed(account)) return;
          attempt++;
        }
        sleep(5 * 1000); // final chance 5sec await
        if (this.checkWhiteListed(account)) return;
        throw new Error('Transaction succesfully sent, but whitelisting wasn't finished in 20seconds');

      return;
      */
    }
    throw new Error('Something went wrong when adding to whitelist: account is whitelisted, mindeposit found but success is not returned');
  }

  public async lockNftForSale(options: TransactionOptions): Promise<void> {
    await sleep(1000);
    throw new Error('Not implemented');
  }

  public async sendNftToSmartContract(options: TransactionOptions): Promise<void> {
    await sleep(1000);
    throw new Error('Not implemented');
  }

  public async setForFixPriceSale(price: number, options: TransactionOptions): Promise<void> {
    await sleep(1000);
    throw new Error('Not implemented');
  }
}

export default MarketController;
