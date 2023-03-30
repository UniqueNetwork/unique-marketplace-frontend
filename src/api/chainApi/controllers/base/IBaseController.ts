interface IBaseController {
  isConnected: boolean;
  setNetwork(options: any): void // TODO: should not be async // TODO: provide proper type (for unique it's sdk, for metamask will be ethers)
}

export default IBaseController;
