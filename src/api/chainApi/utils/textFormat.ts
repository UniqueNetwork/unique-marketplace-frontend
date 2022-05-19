import { BN } from '@polkadot/util';

export function formatKsm (value: BN, kusamaDecimals: number, minPrice: number) {
    if (!value || value.toString() === '0') {
        return '0';
    }

    // const tokenDecimals = incomeDecimals || formatBalance.getDefaults().decimals;
    const tokenDecimals = kusamaDecimals; // TODO:

    if (value.lte(new BN(minPrice * Math.pow(10, tokenDecimals)))) {
        return ` ${minPrice}`;
    }

    // calculate number after decimal point
    const decNum = value?.toString().length - tokenDecimals;
    let balanceStr = '';

    if (decNum < 0) {
        balanceStr = ['0', '.', ...Array.from('0'.repeat(Math.abs(decNum))), value.toString()].join('');
    }

    if (decNum > 0) {
        balanceStr = [value.toString().substr(0, decNum), '.', value.toString().substr(decNum, tokenDecimals - decNum)].join('');
    }

    if (decNum === 0) {
        balanceStr = ['0', '.', value.toString().substr(decNum, tokenDecimals - decNum)].join('');
    }

    const arr = balanceStr.toString().split('.');

    return `${arr[0]}${arr[1] ? `.${arr[1].substr(0, kusamaDecimals)}` : ''}`;
}
