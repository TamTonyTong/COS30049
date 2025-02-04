const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TargetContractModule", (m) => {
  const payer = m.getAccount(0); // First test account
  const payee = m.getAccount(1); // Second test account

  const escrowContract = m.contract("Escrow", [payer, payee]); // Pass constructor arguments

  return { escrowContract };
});
