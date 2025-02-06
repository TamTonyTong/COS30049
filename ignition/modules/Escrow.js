import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CryptoEscrowModule = buildModule("CryptoEscrowModule", (m) => {
    const deployer = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Get deployer account

    const buyer = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const seller = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

    const ethAmount = m.getParameter("ethAmount", "1000000000000000000"); // 1 ETH (in Wei)
    const eth1Amount = m.getParameter("eth1Amount", "1000000000000000000"); // Example: 1000 USD

    const escrow = m.contract("CryptoEscrow", [buyer, seller, ethAmount, eth1Amount]);

    return { escrow };
});

export default CryptoEscrowModule;