export enum CreateAccountModalStages {
  AskSeed,
  AskCredentials,
  Final
}

export type TAccountProperties = {
  seed: string
  address: string
  name?: string
  password?: string
}

export type TAccountModalProps = {
  isVisible: boolean
  onFinish(): void
  onClose(): void
  testid: string
};

export type TCreateAccountBodyModalProps = {
  accountProperties?: TAccountProperties
  onFinish(account: TAccountProperties): void
  onGoBack(): void
  testid: string
};

export type Scanned = {
  content: string;
  isAddress: boolean;
  genesisHash: string;
  name?: string;
}

export type TTransferFunds = {
  sender: string
  recipient: string
  amount: string
}
