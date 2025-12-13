const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting ITAssetManager deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  try {
    // Get the contract factory
    console.log("🔨 Getting ITAssetManager contract factory...");
    const ITAssetManager = await ethers.getContractFactory("ITAssetManager");
    
    // Deploy the contract
    console.log("⏳ Deploying ITAssetManager contract...");
    const itAssetManager = await ITAssetManager.deploy();
    
    // Wait for deployment to be mined
    await itAssetManager.waitForDeployment();
    
    const contractAddress = await itAssetManager.getAddress();
    console.log("✅ ITAssetManager deployed successfully!");
    console.log("📍 Contract address:", contractAddress);
    console.log("👤 Contract owner:", await itAssetManager.owner());
    
    // Verify deployment by calling a view function
    const totalAssets = await itAssetManager.getTotalAssets();
    console.log("📊 Initial total assets:", totalAssets.toString());
    
    // Display useful information for frontend integration
    console.log("\n" + "=".repeat(60));
    console.log("🎯 DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
    console.log(`Chain ID: ${(await ethers.provider.getNetwork()).chainId}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Gas Used: Check transaction receipt`);
    console.log("=".repeat(60));
    
    // Save deployment info to a file for frontend use
    const deploymentInfo = {
      contractAddress: contractAddress,
      deployer: deployer.address,
      network: (await ethers.provider.getNetwork()).name,
      chainId: (await ethers.provider.getNetwork()).chainId.toString(),
      deploymentTime: new Date().toISOString(),
      abi: ITAssetManager.interface.formatJson()
    };
    
    const fs = require('fs');
    const path = require('path');
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // Save deployment info
    fs.writeFileSync(
      path.join(deploymentsDir, 'ITAssetManager.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("💾 Deployment info saved to deployments/ITAssetManager.json");
    
    // Optional: Register a test asset if on development network
    const network = await ethers.provider.getNetwork();
    if (network.chainId === 31337n || network.chainId === 1337n) { // Hardhat local network
      console.log("\n🧪 Registering test asset on local network...");
      try {
        const tx = await itAssetManager.registerAsset(
          "TEST-SERIAL-001",
          "Dell OptiPlex 7090"
        );
        await tx.wait();
        console.log("✅ Test asset registered successfully!");
        
        const asset = await itAssetManager.getAssetHistory(1);
        console.log("📋 Test asset details:", {
          id: asset.id.toString(),
          serialNumber: asset.serialNumber,
          model: asset.model,
          status: asset.status.toString()
        });
      } catch (error) {
        console.log("⚠️  Could not register test asset:", error.message);
      }
    }
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Handle errors
main()
  .then(() => {
    console.log("🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment script failed:", error);
    process.exit(1);
  });