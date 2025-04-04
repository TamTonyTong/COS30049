const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy TradingContract
  const TradingContractFactory = await hre.ethers.getContractFactory("TradingContract");
  const tradingContract = await TradingContractFactory.deploy();
  await tradingContract.waitForDeployment();
  console.log("TradingContract deployed to:", tradingContract.target);

  // Deploy PlatformNFT
  const PlatformNFTFactory = await hre.ethers.getContractFactory("PlatformNFT");
  const platformNFT = await PlatformNFTFactory.deploy("http://127.0.0.1:8545/");
  await platformNFT.waitForDeployment();
  console.log("PlatformNFT deployed to:", platformNFT.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});