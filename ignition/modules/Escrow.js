const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("EscrowModule", (m) => {
  // Define the seller and escrow agent addresses
  const seller = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Seller's address
  const escrowAgent = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Escrow agent's address

  // Deploy the Escrow contract
  const escrow = m.contract("Escrow", [seller, escrowAgent]);

  // Return the deployed contract
  return { escrow };
});