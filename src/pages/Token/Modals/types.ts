import { Token } from '../../../api/graphQL/tokens/types';
import ReactModal from "react-modal";

export interface ModalProps extends ReactModal.Props {
  token?: Token,
  [key: string]: any
}
