import { BN } from '@polkadot/util';

export const formatKsm = (value: BN, kusamaDecimals: number, minPrice: number) => {
    if (!value || value.toString() === '0') {
        return '0';
    }

    if (value.lte(new BN(minPrice * Math.pow(10, kusamaDecimals)))) {
        return ` ${minPrice}`;
    }

    // calculate number after decimal point
    const decNum = value?.toString().length - kusamaDecimals;
    let balanceStr = '';

    if (decNum < 0) {
        balanceStr = ['0', '.', ...Array.from('0'.repeat(Math.abs(decNum))), value.toString()].join('');
    }

    if (decNum > 0) {
        balanceStr = [value.toString().substr(0, decNum), '.', value.toString().substr(decNum, kusamaDecimals - decNum)].join('');
    }

    if (decNum === 0) {
        balanceStr = ['0', '.', value.toString().substr(decNum, kusamaDecimals - decNum)].join('');
    }

    const arr = balanceStr.toString().split('.');

    return `${arr[0]}${arr[1] ? `.${arr[1].substr(0, kusamaDecimals)}` : ''}`;
};

export const fromStringToBnString = (value: string, decimals: number): string => {
    if (!value || !value.length) {
        return '0';
    }

    const numStringValue = value.replace(',', '.');
    const [left, right] = numStringValue.split('.');
    const decimalsFromLessZeroString = right?.length || 0;
    const bigValue = [...(left || []), ...(right || [])].join('').replace(/^0+/, '');
    return (Number(bigValue) * Math.pow(10, decimals - decimalsFromLessZeroString)).toString();
};
