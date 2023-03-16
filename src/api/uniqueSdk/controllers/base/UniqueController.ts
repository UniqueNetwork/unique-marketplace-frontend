import { Client } from '@unique-nft/sdk';
import IBaseController from './IBaseController';

interface UniqueController extends IBaseController {
  uniqueSdk: Client;
}

export default UniqueController;
