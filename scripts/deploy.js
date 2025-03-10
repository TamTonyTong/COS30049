const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", owner.address);

  // Deploy SimToken
  const SimToken = await hre.ethers.getContractFactory("SimToken");
  const simToken = await SimToken.deploy(hre.ethers.parseEther("1000000"));
  await simToken.waitForDeployment();
  console.log("SimToken deployed to:", simToken.target);

  // Deploy TradingContract
  const TradingContract =
    await hre.ethers.getContractFactory("TradingContract");
  const tradingContract = await TradingContract.deploy(simToken.target);
  await tradingContract.waitForDeployment();
  console.log("TradingContract deployed to:", tradingContract.target);

  // Fund TradingContract with tokens and ETH (optional, for testing)
  await simToken.transfer(
    tradingContract.target,
    hre.ethers.parseEther("500000")
  );
  await owner.sendTransaction({
    to: tradingContract.target,
    value: hre.ethers.parseEther("50"),
  });
  console.log("Funded TradingContract with 500,000 SIM and 50 ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
