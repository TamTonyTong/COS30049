const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", owner.address);

  const TradingContractFactory = await hre.ethers.getContractFactory("TradingContract");

  // Deploy the contract
  const tradingContract = await TradingContractFactory.deploy();
  await tradingContract.waitForDeployment();
  console.log("TradingContract deployed to:", tradingContract.target);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
