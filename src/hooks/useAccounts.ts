import { web3Accounts, web3Enable, web3FromAddress, web3ListRpcProviders, web3UseRpcProvider } from '@polkadot/extension-dapp';
import { useEffect, useState } from 'react';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

// returns an array of all the injected sources
// (this needs to be called first, before other requests)
// const allInjected = await web3Enable('my cool dapp');

// returns an array of { address, meta: { name, source } }
// meta.source contains the name of the extension that provides this account

// async function allAccounts =() => await web3Accounts();
// console.log('allAccounts', allAccounts);

export const useAccounts = () => {
    const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);

    const getAccounts = async () => {
        // this call fires up the authorization popup
        const extensions = await web3Enable('my cool dapp');

        if (extensions.length === 0) {
            alert('no extension installed, or the user did not accept the authorization');

            return;
        }

        const allAccounts = await web3Accounts();

        return { allAccounts };
    };

    useEffect(() => {
        getAccounts().then((result) => {
            if (result?.allAccounts?.length ? result.allAccounts.length > 0 : false) {
                const accounts = result?.allAccounts;

                setAccounts(accounts || []);
            } else {
                alert('you have got not account');
            }
        }, (reason) => {
            console.log('reason', reason);
        });
    }, []);

    return [accounts];
};
