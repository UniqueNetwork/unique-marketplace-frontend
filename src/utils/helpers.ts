import { DecodedInfixOrUrlOrCidAndHash } from '@unique-nft/substrate-client/tokens';

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

export const stringToDecodedInfixOrUrlOrCidAndHash = (value: DecodedInfixOrUrlOrCidAndHash | string | undefined) => {
  return typeof value === 'string' ? { fullUrl: value, ipfsCid: '' } : value || { fullUrl: '', ipfsCid: '' };
};
