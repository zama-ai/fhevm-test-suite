import { expect } from "chai";
import { ethers } from "hardhat";

import { createInstances } from "../instance";
import { getSigners, initSigners } from "../signers";

describe("HTTPPubliclDecrypt", function () {
  before(async function () {
    await initSigners(2);
    this.signers = await getSigners();
    this.instances = await createInstances(this.signers);
    const contractFactory = await ethers.getContractFactory(
      "HTTPPublicDecrypt"
    );

    this.contract = await contractFactory.connect(this.signers.alice).deploy();
    await this.contract.waitForDeployment();
    this.contractAddress = await this.contract.getAddress();
    this.instances = await createInstances(this.signers);
  });

  it("test HTTPPubliclDecrypt ebool", async function () {
    const handle = await this.contract.xBool();
    const res = await this.instances.alice.publicDecrypt([handle]);
    console.log(res);
  });
});
