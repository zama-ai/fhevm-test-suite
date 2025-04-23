import { ethers, hardhatArguments as network } from "hardhat";

const currentTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
};

const argEvents =
  "(uint256 indexed counter, uint256 requestID, bytes32[] cts, address contractCaller, bytes4 callbackSelector)";
const ifaceEventDecryption = new ethers.Interface([
  "event DecryptionRequest" + argEvents,
]);

let firstBlockListening: number;

export const initDecryptionOracle = async (): Promise<void> => {
  firstBlockListening = await ethers.provider.getBlockNumber();

  const eventSignature = ifaceEventDecryption
    .getEvent("DecryptionRequest")
    .format();
  const topicHash =
    ifaceEventDecryption.getEvent("DecryptionRequest").topicHash;

  ethers.provider.on(
    {
      address: process.env.DECRYPTION_ORACLE_ADDRESS,
      topics: [topicHash],
    },
    async (log) => {
      const parsedLog = ifaceEventDecryption.parseLog(log);
      const [counter, requestID, cts, contractCaller, callbackSelector] =
        parsedLog.args;

      console.log(
        `${currentTime()} - Requested decrypt on block ${
          log.blockNumber
        } (counter ${counter} - requestID ${requestID})`
      );
    }
  );
};

export const awaitAllDecryptionResults = async (): Promise<void> => {
  firstBlockListening = (await ethers.provider.getBlockNumber()) + 1;
  await new Promise((resolve) => setTimeout(resolve, 20000));
};
