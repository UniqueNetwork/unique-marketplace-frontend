import Web3 from 'web3';
import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { addressToEvm } from '@polkadot/util-crypto';
import marketplaceAbi from './abi/marketPlaceAbi.json';
import config from '../../../config';
import { sleep } from '../../../utils/helpers';
import { IMarketController, TransactionOptions } from '../types';

// TODO: Global todo list
/*
1. Split into two controllers: kusama and uniq one
1.2. Consider moving unq methods into token controller instead
*/
// TODO: Ideas
/*
1. Mixins. Inherit from tokenController, inherit from collectionController, create multiple controllers for buy/sell/etc
2. Modules (sell module, buy module, etc.) that accepts rawApi's
 */
export type MartketControllerConfig = {
  contractAddress?: string,
  uniqueSubstrateApiRpc?: string,
  escrowAddress?: string,
  marketplaceAbi?: any,
  minPrice?: number,
  kusamaDecimals?: number,
  defaultGasAmount?: number
}

const defaultMarketPlaceControllerConfig: MartketControllerConfig = {
  contractAddress: config.contractAddress,
  uniqueSubstrateApiRpc: config.uniqueSubstrateApiRpc,
  escrowAddress: config.escrowAddress,
  marketplaceAbi: marketplaceAbi,
  minPrice: config.minPrice,
  defaultGasAmount: 2500000
};

class MarketController implements IMarketController {
  private uniqApi: ApiPromise;
  private kusamaApi: ApiPromise;
  private contractAddress: string;
  private uniqueSubstrateApiRpc: string;
  private escrowAddress: string;
  private marketplaceAbi: any; // TODO: grab type form old market
  private minPrice: number;
  private kusamaDecimals: number;
  private web3Instance: any; // TODO: can be typed
  private defaultGasAmount: number;

  constructor(uniqApi: ApiPromise, kusamaApi: ApiPromise, config: MartketControllerConfig = {}) {
    this.uniqApi = uniqApi;
    this.kusamaApi = kusamaApi;
    const options = { ...defaultMarketPlaceControllerConfig, ...config };
    if (!options.contractAddress) throw new Error('Contract address not found');
    this.contractAddress = options.contractAddress;
    if (!options.uniqueSubstrateApiRpc) throw new Error('Uniq substrate rpc not provided');
    this.uniqueSubstrateApiRpc = options.uniqueSubstrateApiRpc;
    if (!options.escrowAddress) throw new Error('Escrow address is not provided');
    this.marketplaceAbi = options.marketplaceAbi;
    if (!options.minPrice) throw new Error('Min price not provided');
    this.minPrice = options.minPrice;
    if (!options.kusamaDecimals) throw new Error('Kusama decimals not provided');
    this.kusamaDecimals = options.kusamaDecimals; // TODO: could and should be taken from kusamaApi
    this.defaultGasAmount = options.defaultGasAmount || 2500000;
    const provider = new Web3.providers.HttpProvider(this.uniqueSubstrateApiRpc);
    const web3 = new Web3(provider);
    this.web3Instance = web3;
  }

  private async repeatCheckForTransactionFinish (checkIfCompleted: () => Promise<boolean>, options: { maxAttempts: boolean, awaitBetweenAttempts: number } | null = null): Promise<void> {
    let attempt = 0;
    const maxAttempts = options?.maxAttempts || 10;
    const awaitBetweenAttempts = options?.awaitBetweenAttempts || 2 * 1000;

    while (attempt < maxAttempts) {
      const isCompleted = await checkIfCompleted();
      if (isCompleted) return;
      attempt++;
      await sleep(awaitBetweenAttempts);
    }

    throw new Error('Awaiting tx execution timed out');
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

  // #region sell
  public async checkWhiteListed(account: string): Promise<boolean> {
    const ethAddress = this.getEthAccount(account);
    try {
      return (await this.kusamaApi.query.evmContractHelpers.allowlist(this.contractAddress, ethAddress)).toJSON() as boolean;
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

  private async checkOnEth (account: string): Promise<boolean> {
      // TODO: we need obtain tokenInfo here (we can't pass it down from somewhere else since we need to check for the most recent version on every repeat)
      // !!!!TODO: somehow get access to TokenController from here (avoiding circular dependencies)!!!!
      // const token: TokenDetailsInterface = await getTokenInfo(collectionInfo, tokenId);
      const token = 'debug' as any;
      const ethAccount = this.getEthAccount(account);
      if (token?.owner?.Substrate === account || token?.owner?.Ethereum?.toLowerCase() === ethAccount) {
        return true;
      }
      return false;
  }

  // transfer to etherium (kusama api)
  public async lockNftForSale(account: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    // check if already on eth
    const ethAccount = this.getEthAccount(account);
    const isOnEth = await this.checkOnEth(account);
    if (isOnEth) return;
    // TODO: params for transfer form probably incorrect, test carefully
    const tx = this.kusamaApi.tx.unique.transferFrom(ethAccount, account, collectionId, tokenId, 1);
    const signedTx = await options.sign(tx);
    // execute signedTx
    try {
      await this.repeatCheckForTransactionFinish(async () => { return this.checkOnEth(account); });
      return;
    } catch (e) {
      console.error('lockNftForSale error pushed upper');
      throw e;
    }
  }

  private async checkIfNftApproved (tokenOwner: string, collectionId: string, tokenId: string, options: TransactionOptions) {
    const ethAccount = this.getEthAccount(tokenOwner);
    // TODO: same story - check this one carefully for account params, i assume they expect objects
    const approvedCount = (await this.uniqApi.rpc.unique.allowance(collectionId, tokenOwner, ethAccount, tokenId)).toJSON() as number;

    return approvedCount === 1;
  }

  // aprove token
  public async sendNftToSmartContract(account: string, collectionId: string, tokenId: string, options: TransactionOptions): Promise<void> {
    // TODO: same here
    const token = 'debug' as any;
    const approved = await this.checkIfNftApproved(token.owner, collectionId, tokenId);
    const abi = (evmCollectionInstance.methods as EvmCollectionAbiMethods).approve(contractAddress, tokenId).encodeABI();

    if (approved) {
      return;
    }
    const tx = this.uniqApi.tx.evm.call(
      this.getEthAccount(account),
      evmCollectionInstance.options.address,
      abi,
      0,
      { gas: this.defaultGasAmount },
      await this.web3Instance.eth.getGasPrice(),
      null
    );
    const signedTx = await options.sign(tx);
    // execute signedTx
    await this.repeatCheckForTransactionFinish(async () => { return this.checkIfNftApproved(token.owner, collectionId, tokenId); });
  }

  // checkAsk - put on sale
  public async setForFixPriceSale(account: string, price: number, options: TransactionOptions): Promise<void> {
    const abi = (matcherContractInstance.methods as MarketplaceAbiMethods).addAsk(price.toString(), '0x0000000000000000000000000000000000000001', evmCollectionInstance.options.address, tokenId).encodeABI();
    const tx = kusamaApi.tx.evm.call(
      this.getEthAccount(account),
      this.contractAddress,
      abi,
      0,
      { gas: this.defaultGasAmount },
      await this.web3Instance.eth.getGasPrice(),
      null
    );
    const signedTx = await options.sign(tx);
    // TODO: execute tx
    // await repeat ?
  }

  // #endregion sell
  // #region buy

  // checkDepositReady
  private async getUserDeposit (account: string): Promise<any /* BN */> {
    const ethAccount = this.getEthAccount(account);
    const matcherContractInstance = this.web3Instance.eth.Contract(this.marketplaceAbi, this.contractAddress, {
      from: ethAccount
    });
    const result = await (matcherContractInstance.methods/* as MarketplaceAbiMethods*/).balanceKSM(ethAccount).call();

    if (result) {
      const deposit = new BN(result);

      // Number(this.formatKsm(deposit)) > minPrice ? localStorage.setItem('deposit', JSON.stringify(result)) : localStorage.removeItem('deposit'); // TODO: figure out what we have been saving in localStorage and why

      return deposit;
    }

    throw new Error('Failed to get user deposit');
  }

  // TODO: utils
  private formatKsm (value: BN) {
    if (!value || value.toString() === '0') {
      return '0';
    }

    // const tokenDecimals = incomeDecimals || formatBalance.getDefaults().decimals;
    const tokenDecimals = this.kusamaDecimals; // TODO:

    if (value.lte(new BN(this.minPrice * Math.pow(10, tokenDecimals)))) {
      return ` ${this.minPrice}`;
    }

    // calculate number after decimal point
    const decNum = value?.toString().length - tokenDecimals;
    let balanceStr = '';

    if (decNum < 0) {
      balanceStr = ['0', '.', ...Array.from('0'.repeat(Math.abs(decNum))), ...value.toString()].join('');
    }

    if (decNum > 0) {
      balanceStr = [...value.toString().substr(0, decNum), '.', ...value.toString().substr(decNum, tokenDecimals - decNum)].join('');
    }

    if (decNum === 0) {
      balanceStr = ['0', '.', ...value.toString().substr(decNum, tokenDecimals - decNum)].join('');
    }

    const arr = balanceStr.toString().split('.');

    return `${arr[0]}${arr[1] ? `.${arr[1].substr(0, this.kusamaDecimals)}` : ''}`;
  }

  // TODO: we have 3 outcomes ('already enough funds'/'not enough funds, sign to add'/'not enough funds on account'), will collide with UI since we expect bool from here and nahve no control over stages texts
  public async addDeposit (account: string, tokenId: string, options: TransactionOptions): Promise<void> {
    const userDeposit = await this.getUserDeposit(account);
    const token = {} as any; // TODO: get token
    if (!token) throw new Error('Token not found');
    if (!userDeposit) throw new Error('No user deposit');

    if (token.price < userDeposit) {
      // Deposit already exists
      return;
    }
    // Get required amount to deposit
    const needed = token.price.sub(userDeposit); // TODO: keep in mind that we are working with BN.js
    const kusamaAvailableBalance = new BN(0); // TODO: some complicated stuff to be migrated

    if (kusamaAvailableBalance?.lt(needed)) {
      throw new Error(`Your KSM balance is too low: ${this.formatKsm(kusamaAvailableBalance)} KSM. You need at least: ${this.formatKsm(needed)} KSM`);
    }
    // accountId: encodedKusamaAccount,
    const tx = this.kusamaApi.tx.balances.transfer(this.escrowAddress, needed);
    const signedTx = await options.sign(tx);
    // TODO: await deposit
    // await this.repeatCheckForTransactionFinish(async () => { (await this.getUserDeposit(account)) >= tokenPrice; });
  }

  // buyToken
  public async buyToken (account: string, collectionId: string, tokenId: string, options: TransactionOptions) {
    const ethAccount = this.getEthAccount(account);
    const abi = (matcherContractInstance.methods).buyKSM(evmCollectionInstance.options.address, tokenId, ethAccount, ethAccount).encodeABI();
    const matcherContractInstance = this.web3Instance.eth.Contract(this.marketplaceAbi, this.contractAddress, {
      from: ethAccount
    });

    const tx = this.kusamaApi.tx.evm.call(
      ethAccount,
      this.contractAddress,
      abi,
      0,
      { gas: this.defaultGasAmount },
      await this.web3Instance.eth.getGasPrice(),
      null
    );

    const signedTx = await options.sign(tx);
    // TODO: await purchase
    // await this.repeatCheckForTransactionFinish(async () => { (await this.getToken(collectionId, tokenId)) === account; });
  }

  // #endregion buy

  // #region delist
  // #endregion delist

  // #region transfer
  // #endregion transfer
}

export default MarketController;
