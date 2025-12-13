const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ITAssetManager", function () {
  let ITAssetManager;
  let itAssetManager;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract
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

      // Check event emission
      const event = receipt.logs.find(log => {
        try {
          const parsed = itAssetManager.interface.parseLog(log);
          return parsed?.name === 'AssetRegistered';
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      
      // Check asset details
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

    it("Should not allow non-owner to register assets", async function () {
      await expect(
        itAssetManager.connect(addr1).registerAsset("SERIAL001", "Dell OptiPlex")
      ).to.be.revertedWithCustomError(itAssetManager, "OwnableUnauthorizedAccount");
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
      expect(asset.sanitizationHash).to.equal(wipeHash);
      expect(asset.sanitizationTime).to.be.gt(0);
    });

    it("Should not allow sanitization of non-existent asset", async function () {
      await expect(
        itAssetManager.proveSanitization(999, "QmX1234567890abcdef")
      ).to.be.revertedWithCustomError(itAssetManager, "AssetNotFound");
    });

    it("Should not allow sanitization of already sanitized asset", async function () {
      await itAssetManager.proveSanitization(1, "QmX1234567890abcdef");
      
      await expect(
        itAssetManager.proveSanitization(1, "QmY0987654321fedcba")
      ).to.be.revertedWithCustomError(itAssetManager, "InvalidAssetStatus");
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

    it("Should not allow recycling non-sanitized asset", async function () {
      await itAssetManager.registerAsset("SERIAL002", "HP EliteBook");
      
      await expect(
        itAssetManager.recycleAsset(2)
      ).to.be.revertedWithCustomError(itAssetManager, "InvalidAssetStatus");
    });
  });

  describe("Asset Transfer", function () {
    beforeEach(async function () {
      await itAssetManager.registerAsset("SERIAL001", "Dell OptiPlex");
      await itAssetManager.proveSanitization(1, "QmX1234567890abcdef");
    });

    it("Should transfer asset ownership", async function () {
      const tx = await itAssetManager.transferAsset(1, addr1.address);
      await tx.wait();

      const asset = await itAssetManager.getAssetHistory(1);
      expect(asset.owner).to.equal(addr1.address);
      expect(asset.status).to.equal(3); // SOLD
    });

    it("Should allow asset owner to transfer", async function () {
      // First transfer to addr1
      await itAssetManager.transferAsset(1, addr1.address);
      
      // addr1 can transfer to addr2
      const tx = await itAssetManager.connect(addr1).transferAsset(1, addr2.address);
      await tx.wait();

      const asset = await itAssetManager.getAssetHistory(1);
      expect(asset.owner).to.equal(addr2.address);
    });

    it("Should not allow unauthorized transfer", async function () {
      await expect(
        itAssetManager.connect(addr1).transferAsset(1, addr2.address)
      ).to.be.revertedWithCustomError(itAssetManager, "NotAssetOwner");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await itAssetManager.registerAsset("SERIAL001", "Dell OptiPlex");
      await itAssetManager.registerAsset("SERIAL002", "HP EliteBook");
      await itAssetManager.proveSanitization(1, "QmX1234567890abcdef");
    });

    it("Should return correct total assets", async function () {
      expect(await itAssetManager.getTotalAssets()).to.equal(2);
    });

    it("Should check serial number existence", async function () {
      expect(await itAssetManager.serialNumberExists("SERIAL001")).to.be.true;
      expect(await itAssetManager.serialNumberExists("NONEXISTENT")).to.be.false;
    });

    it("Should filter assets by status", async function () {
      const registeredAssets = await itAssetManager.getAssetsByStatus(0, 0, 10); // REGISTERED
      const sanitizedAssets = await itAssetManager.getAssetsByStatus(1, 0, 10); // SANITIZED

      expect(registeredAssets.length).to.equal(1);
      expect(registeredAssets[0]).to.equal(2);
      
      expect(sanitizedAssets.length).to.equal(1);
      expect(sanitizedAssets[0]).to.equal(1);
    });
  });
});