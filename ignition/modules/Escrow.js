const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("EscrowModule", (m) => {
  // Define the seller and escrow agent addresses
  const seller = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace with the seller's address
  const escrowAgent = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"; // Replace with the escrow agent's address

  // Deploy the Escrow contract
  const escrow = m.contract("Escrow", [seller, escrowAgent]);

  // Return the deployed contract
  return { escrow };
});