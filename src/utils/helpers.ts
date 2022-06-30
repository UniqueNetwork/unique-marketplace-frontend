export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const setUrlParameter = (parameter: string, value: string) => {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(parameter, value);
  history.pushState(null, '', `${window.location.pathname}?${searchParams.toString()}`);
};

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
