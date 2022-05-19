export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const setUrlParameter = (parameter: string, value: string) => {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(parameter, value);
  history.pushState(null, '', `${window.location.pathname}?${searchParams.toString()}`);
};
