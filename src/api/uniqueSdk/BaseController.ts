import IBaseController from './controllers/base/IBaseController';
import MetamaskController from './controllers/base/MetamaskController';
import UniqueController from './controllers/base/UniqueController';

// T is interface of controller (ex. IMarketController)
class BaseController<T> implements IBaseController {
  public uniqueController: UniqueController & T;
  public metamaskController: MetamaskController & T;

  constructor(uniqueController: UniqueController & T, metamaskController: MetamaskController & T) {
    this.uniqueController = uniqueController;
    this.metamaskController = metamaskController;
  }

  async setNetwork(options: unknown): Promise<void> {
    try { await this.uniqueController.setNetwork(options); } catch (e) { console.error('Failed to set network for unique', e); throw e; }
    try { await this.metamaskController.setNetwork(options); } catch (e) { console.error('Failed to set network for metamask', e); throw e; }
  }

  // TODO: provide type for signer
  // TODO: extract connection type from signer to figure out whether we are working with polka or evm
  protected getController(signer: any): T {
    if (signer) return this.uniqueController;
    return this.metamaskController;
  }

  protected getDefaultController(): T {
    return this.uniqueController;
  }
}

export default BaseController;
