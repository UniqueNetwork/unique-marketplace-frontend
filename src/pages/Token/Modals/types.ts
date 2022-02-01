import { Token } from '../../../api/graphQL/tokens/types';

export interface ModalProps extends ReactModal.Props {
  token?: Token,
  [key: string]: any
}
