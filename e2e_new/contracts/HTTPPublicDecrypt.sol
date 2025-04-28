// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import { E2EFHEVMConfig } from "./E2EFHEVMConfigLocal.sol";

/// @notice Contract for testing asynchronous decryption using the Gateway
contract HTTPPublicDecrypt is E2EFHEVMConfig  {
    /// @dev Encrypted state variables
    ebool public xBool;
    euint8 public xUint8;
    euint256 public xUint256;
    ebytes256 public xBytes256;

    /// @notice Constructor to initialize the contract and set up encrypted values
    constructor() {
        /// @dev Initialize encrypted variables with sample values
        xBool = FHE.asEbool(true);
        FHE.makePubliclyDecryptable(xBool);

        xUint8 = FHE.asEuint8(242);
        FHE.makePubliclyDecryptable(xUint8);

        xUint256 = FHE.asEuint256(30758500220949650120801849894410178896950959585366318130183473670122320944746);
        FHE.makePubliclyDecryptable(xUint256);

        xBytes256 = FHE.asEbytes256(
             FHE.padToBytes256(
                 hex"d3f1e794f90b63477d50293f0ff0d232ca3f485213a98b4c82523e4e4b042484c0a695f758309eb108ac7f6b9105fbdd0c22069720ae2f447e360af26991020f40492250f0e435282c97f6217022c42601301c494c266f9ca8a312e642ce044dda2e77965166274243cd99f082b935f9d51d004a9e3d3f4dd9d40d674be34de4921d08afab17cc11768563d3d6ba8d96252a159941b064224c92cc4fa68b873e"
             )
         );
         FHE.makePubliclyDecryptable(xBytes256);
    }
}