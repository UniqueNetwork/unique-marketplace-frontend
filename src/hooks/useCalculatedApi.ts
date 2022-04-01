import config from '../config';

export type TCalculatedBid = {
    // sum of bids from this account
    bidderPendingAmount: string,
    // min bid for this account in order to place a max bid
    minBidderAmount: string,
    // max bid for this auction
    contractPendingPrice: string,
    // step for this auction
    priceStep: string
}

export const useCalculatedApi = () => {
    console.log('config', config);
    const getCalculatedBid = async ({ collectionId, tokenId, account, setCalculatedBidFromServer }: { collectionId: number, tokenId: number, account: string, setCalculatedBidFromServer: ({ bidderPendingAmount, minBidderAmount }: TCalculatedBid) => void }) => {
        let responsefromBack;
        const url = `${config?.uniqueApiUrl}auction/calculate`;
        console.log('url', url);
        const data = {
            collectionId: Number(collectionId),
            tokenId: Number(tokenId),
            bidderAddress: account
        };
        console.log(data);
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        accept: 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                responsefromBack = await response.json();
                setCalculatedBidFromServer(responsefromBack);
            } catch (error) {
                console.error('Ошибка:', error);
            }
    };

    return { getCalculatedBid };
};
