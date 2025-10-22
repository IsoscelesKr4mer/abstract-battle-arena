const hre = require("hardhat");

async function main() {
  console.log("Deploying Abstract Battle Arena contract...");

  // Get the contract factory
  const AbstractBattleArena = await hre.ethers.getContractFactory("AbstractBattleArena");

  // Deploy the contract
  const battleArena = await AbstractBattleArena.deploy();

  // Wait for deployment to finish
  await battleArena.waitForDeployment();

  const contractAddress = await battleArena.getAddress();
  
  console.log("✅ Abstract Battle Arena deployed to:", contractAddress);
  console.log("📋 Contract Address:", contractAddress);
  console.log("🔗 Network:", hre.network.name);
  console.log("⛽ Gas Used:", (await hre.ethers.provider.getTransactionReceipt(contractAddress.deploymentTransaction().hash)).gasUsed.toString());

  // Verify the contract if on a live network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await battleArena.deploymentTransaction().wait(6);
    
    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: await hre.ethers.getSigner().getAddress(),
    deploymentTime: new Date().toISOString(),
    transactionHash: contractAddress.deploymentTransaction().hash
  };

  const fs = require('fs');
  const path = require('path');
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("💾 Deployment info saved to:", deploymentFile);
  
  // Display important information
  console.log("\n🎮 Abstract Battle Arena Deployment Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📝 Next Steps:");
  console.log("1. Update your frontend .env with REACT_APP_CONTRACT_ADDRESS=" + contractAddress);
  console.log("2. Update your backend configuration");
  console.log("3. Test the contract functions");
  console.log("4. Deploy your frontend and backend");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
