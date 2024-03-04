import { DecodedInfixOrUrlOrCidAndHash } from 'api/chainApi/types';
import { INestingToken } from '../components/BundleTree/types';

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Just for FF: becouse it throw an error too many calls to History API
export const setUrlParameter = (() => {
  let delayId: NodeJS.Timeout | undefined;

  return (parameter: string, value: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(parameter, value);
    if (delayId) clearTimeout(delayId);
    delayId = setTimeout(() => {
      history.pushState(null, '', `${window.location.pathname}?${searchParams.toString()}`);
    }, 100);
  };
})();

export const parseFilterState = (value: string | null) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch (e) {
    return null;
  }
};

export const debounce = (fn: () => any, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: []) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export type DecodedVideoUri = ({
  urlInfix?: string;
  hash?: string | null;
} | {
  url?: string;
  hash?: string | null;
} | {
  ipfsCid?: string;
  hash?: string | null;
}) & {
  fullUrl?: string | null;
} | DecodedInfixOrUrlOrCidAndHash;

export const stringToDecodedInfixOrUrlOrCidAndHash = (value: DecodedVideoUri | string | undefined) => {
  return typeof value === 'string' ? { fullUrl: value, ipfsCid: '' } : value || { fullUrl: '', ipfsCid: '' };
};

export const countNestedChildren = (nestingChildTokens: INestingToken[]) => {
  let count = 0;
  const countChildren = (tokenChildren: INestingToken[]) => {
    if (tokenChildren.length === 0) return count;
    else {
      count += tokenChildren.length;
      tokenChildren.forEach((child) => countChildren(child.nestingChildTokens || []));
    }
  };
  countChildren(nestingChildTokens || []);
  return count;
};

function padZero(str: string, len?: number) {
  len = len || 2;
  const zeros = new Array(len).join('0');
  return (zeros + str).slice(-len);
}

export function invertColor(hex: string) {
  if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
      return '';
  }
  // invert color components
  const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16);
  const g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16);
  const b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
  // pad each with zeros and return
  return '#' + padZero(r) + padZero(g) + padZero(b);
}

export const truncateDecimalsBalanceSheet = (balance: string | undefined) => {
  if (!balance) {
    return '0';
  }
  const arrBalance = balance.split('.');

  if (arrBalance.length === 1) {
    return balance;
  }
  const lastElem = arrBalance.length - 1;
  arrBalance[lastElem] = arrBalance[lastElem].slice(0, 4);
  return arrBalance.join('.');
};
