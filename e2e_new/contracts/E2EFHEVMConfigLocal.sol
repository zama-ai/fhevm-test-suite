// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHEVMConfigStruct, FHE} from "@fhevm/solidity/lib/FHE.sol";

address constant DECRYPTION_ORACLE_ADDRESS = 0x096b4679d45fB675d4e2c1E4565009Cec99A12B1;

library DefaultFHEVMConfig {
    function getConfig() internal pure returns (FHEVMConfigStruct memory) {
        return
            FHEVMConfigStruct({
                ACLAddress: 0x339EcE85B9E11a3A3AA557582784a15d7F82AAf2,
                FHEVMExecutorAddress: 0x596E6682c72946AF006B27C131793F2b62527A4b,
                KMSVerifierAddress: 0x208De73316E44722e16f6dDFF40881A3e4F86104,
                InputVerifierAddress: 0x3a2DA6f1daE9eF988B48d9CF27523FA31a8eBE50
            });
    }
}

contract E2EFHEVMConfig {
    constructor() {
        FHE.setCoprocessor(DefaultFHEVMConfig.getConfig());
        FHE.setDecryptionOracle(DECRYPTION_ORACLE_ADDRESS);
    }
}