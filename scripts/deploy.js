const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", owner.address);

  // Deploy TradingContract
  const TradingContract =
    await hre.ethers.getContractFactory("TradingContract");
  await tradingContract.waitForDeployment();
  console.log("TradingContract deployed to:", tradingContract.target);

  // Fund TradingContract with tokens and ETH (optional, for testing)
  await owner.sendTransaction({
    to: tradingContract.target,
    value: hre.ethers.parseEther("50"),
  });
  console.log("Funded TradingContract with 50 ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
