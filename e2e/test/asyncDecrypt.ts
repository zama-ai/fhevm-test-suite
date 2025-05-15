import { ethers } from "hardhat";

const currentTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
};

const pendingDecryptionRequestCounters = new Set<bigint>();
const pendingDecryptionRequestParameters = new Map<bigint, [string, bigint]>();

const decryptionRequestEventFragment =
  "event DecryptionRequest(uint256 indexed counter, uint256 requestID, bytes32[] cts, address contractCaller, bytes4 callbackSelector)";
const ifaceRequest = new ethers.Interface([decryptionRequestEventFragment]);
const topicHashRequest = ifaceRequest.getEvent("DecryptionRequest")!.topicHash;
const filterOracle = {
  address: process.env.DECRYPTION_ORACLE_ADDRESS!,
  topics: [topicHashRequest],
};

const decryptionFulfillEventFragment =
  "event DecryptionFulfilled(uint256 indexed requestID)";
const ifaceFulfill = new ethers.Interface([decryptionFulfillEventFragment]);
const topicHashFulfill = ifaceFulfill.getEvent(
  "DecryptionFulfilled"
)!.topicHash;
const filterFulfill = {
  topics: [topicHashFulfill],
};

export const initDecryptionOracle = async (): Promise<void> => {
  ethers.provider.on(filterOracle, async (log) => {
    const parsed = ifaceRequest.parseLog(log);
    const { counter, requestID, cts, contractCaller, callbackSelector } =
      parsed!.args;
    console.log(
      `${currentTime()} - Requested public decryption on block ${
        log.blockNumber
      } ` + ` (counter ${counter} - requestID ${requestID})`
    );

    pendingDecryptionRequestCounters.add(counter);
    pendingDecryptionRequestParameters.set(counter, [
      contractCaller,
      requestID,
    ]);
  });

  ethers.provider.on(filterFulfill, async (log) => {
    const parsed = ifaceFulfill.parseLog(log);
    const { requestID } = parsed!.args;
    const emitterAddress = log.address;

    // find which counter(s) this maps to
    for (const [counter, [caller, id]] of pendingDecryptionRequestParameters) {
      if (id === requestID && caller === emitterAddress) {
        pendingDecryptionRequestCounters.delete(counter);
        pendingDecryptionRequestParameters.delete(counter);
        console.log(
          `${currentTime()} - Fulfilled public decryption on block ${
            log.blockNumber
          } ` + ` (counter ${counter} - requestID ${requestID})`
        );
      }
    }
  });
};

export const awaitAllDecryptionResults = async (): Promise<void> => {
  // WARNING: if the callback reverts, this function will timeout
  // TODO: to avoid this issue, a solution is to add an http endpoint on the relayer to know if the callback reverted,
  // since this cannot be detected onchain with new oracle design (fulfill now happens by calling directly the dapp contract)

  // if nothing pending, return immediately
  if (pendingDecryptionRequestCounters.size === 0) {
    console.log(`${currentTime()} - No pending decryption requests.`);
    return;
  }

  // otherwise poll until the Set is emptied by your event‐listener
  console.log(
    `${currentTime()} - Waiting for ${pendingDecryptionRequestCounters.size}` +
      ` pending decryption request(s) to be fulfilled…`
  );
  // every 100ms, check if we're done
  while (pendingDecryptionRequestCounters.size > 0) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  console.log(`${currentTime()} - All decryption requests fulfilled.`);
};
