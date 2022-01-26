export const collectionName16Decoder = (name: number[]) => {
  const collectionNameArr = name.map((item: number) => item);

  return String.fromCharCode(...collectionNameArr);
};

export const collectionName8Decoder = (name: number[]) => {
  const collectionNameArr = Array.prototype.slice.call(name);

  return String.fromCharCode(...collectionNameArr);
};

export const hex2a = (hexx: string) => {
  const hex: string = hexx.substring(2);
  let str = '';

  for (let i = 0; i < hex.length && hex.substr(i, 2) !== '00'; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }

  return str;
};
