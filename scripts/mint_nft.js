const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const platformNFTAddress = "0xe4d6664D5b191960273E9aE2eA698DA30FDF519f"; 
  const userAddress = "0x6ED13c14F988C123b35fF37f260334CBA1e2C553";

  const platformNFT = await hre.ethers.getContractAt("PlatformNFT", platformNFTAddress, deployer);
  const tx = await platformNFT.mint(userAddress);
  const receipt = await tx.wait();

  const tokenId = receipt.logs[0].args.tokenId.toString();
  console.log(`NFT minted with tokenId ${tokenId} to ${userAddress}`);
  console.log("Transaction hash:", receipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});