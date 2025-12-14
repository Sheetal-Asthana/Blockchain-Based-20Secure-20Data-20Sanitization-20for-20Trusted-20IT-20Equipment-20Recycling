const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ITAssetManager", function () {
  let ITAssetManager;
  let itAssetManager;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    ITAssetManager = await ethers.getContractFactory("ITAssetManager");
    itAssetManager = await ITAssetManager.deploy();
    await itAssetManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await itAssetManager.owner()).to.equal(owner.address);
    });

    it("Should start with zero assets", async function () {
      expect(await itAssetManager.getTotalAssets()).to.equal(0);
    });
  });

  describe("Asset Registration", function () {
    it("Should register a new asset", async function () {
      const tx = await itAssetManager.registerAsset("SERIAL001", "Dell OptiPlex");
      const receipt = await tx.wait();

      const asset = await itAssetManager.getAssetHistory(1);
      expect(asset.serialNumber).to.equal("SERIAL001");
      expect(asset.model).to.equal("Dell OptiPlex");
      expect(asset.status).to.equal(0); // REGISTERED
      expect(asset.owner).to.equal(owner.address);
    });

    it("Should not allow duplicate serial numbers", async function () {
      await itAssetManager.registerAsset("SERIAL001", "Dell OptiPlex");
      
      await expect(
        itAssetManager.registerAsset("SERIAL001", "HP EliteBook")
      ).to.be.revertedWithCustomError(itAssetManager, "SerialNumberAlreadyExists");
    });
  });

  describe("Sanitization Proof", function () {
    beforeEach(async function () {
      await itAssetManager.registerAsset("SERIAL001", "Dell OptiPlex");
    });

    it("Should prove sanitization successfully", async function () {
      const wipeHash = "QmX1234567890abcdef";
      
      const tx = await itAssetManager.proveSanitization(1, wipeHash);
      await tx.wait();

      const asset = await itAssetManager.getAssetHistory(1);
      expect(asset.status).to.equal(1); // SANITIZED
      expect(asset.ipfsHash).to.equal(wipeHash);
      expect(asset.technician).to.equal(owner.address);
      expect(asset.sanitizationTime).to.be.gt(0);
    });
  });

  describe("Asset Recycling", function () {
    beforeEach(async function () {
      await itAssetManager.registerAsset("SERIAL001", "Dell OptiPlex");
      await itAssetManager.proveSanitization(1, "QmX1234567890abcdef");
    });

    it("Should recycle asset and award carbon credits", async function () {
      const tx = await itAssetManager.recycleAsset(1);
      await tx.wait();

      const asset = await itAssetManager.getAssetHistory(1);
      expect(asset.status).to.equal(2); // RECYCLED
      expect(asset.carbonCredits).to.equal(10);
      expect(asset.recyclingTime).to.be.gt(0);
    });
  });
});