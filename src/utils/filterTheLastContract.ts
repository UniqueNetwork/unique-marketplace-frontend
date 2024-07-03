import { MarketContract } from "api/restApi/settings/types";

export const filterTheLastContract = (
  uniqueContracts: MarketContract[]
): MarketContract | null => {
  let contractWithHighestVersion: MarketContract | null = null;
  let highestVersion = 0;

  uniqueContracts.forEach((contract) => {
    if (Number(contract.version) > Number(highestVersion)) {
      highestVersion = Number(contract.version);
      contractWithHighestVersion = contract;
    }
  });

  return contractWithHighestVersion;
};
