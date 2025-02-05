"use client"

import { useState, useEffect } from "react";
import { JsonRpcProvider, Contract, ethers, Wallet } from "ethers";

// Replace with your local node's RPC URL

const ESCROW_ABI = [
  // Insert your contract ABI here (found in artifacts/contracts/Escrow.sol/Escrow.json)
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_seller",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_escrowAgent",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Deposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Refunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Released",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "amount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "buyer",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "escrowAgent",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isCompleted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isFunded",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "refundBuyer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "releaseFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "seller",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
const LOCAL_RPC_URL = "http://127.0.0.1:8545";
const ESCROW_CONTRACT_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace with your deployed contract address
function App() {
  const [provider, setProvider] = useState<JsonRpcProvider | null>(null);
  const [escrow, setEscrow] = useState<Contract | null>(null);

  // Define the addresses
  const SELLER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const ESCROW_AGENT_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const BUYER_ADDRESS = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

  // Define private keys
  const ESCROW_AGENT_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
  const BUYER_PRIVATE_KEY = "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"; // Replace with the buyer's private key

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize provider
        const provider = new JsonRpcProvider(LOCAL_RPC_URL);

        // Initialize contract with a default signer (escrow agent)
        const defaultSigner = new Wallet(ESCROW_AGENT_PRIVATE_KEY, provider);
        const contract = new Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, defaultSigner);

        // Update state
        setProvider(provider);
        setEscrow(contract);
      } catch (error) {
        console.error("Error initializing provider or signer:", error);
        alert("Failed to initialize provider or signer.");
      }
    };
    init();
  }, []);

  const deposit = async () => {
    if (escrow && provider) {
      try {
        // Create a signer for the buyer
        const buyerSigner = new Wallet(BUYER_PRIVATE_KEY, provider);
        const contractWithBuyerSigner = escrow.connect(buyerSigner);

        // Call the deposit function as the buyer
        const tx = await contractWithBuyerSigner.deposit({ value: ethers.parseEther("10") });
        await tx.wait();
        alert("Funds deposited!");
      } catch (error) {
        console.error("Error depositing funds:", error);
        alert("Failed to deposit funds.");
      }
    }
  };

  const releaseFunds = async () => {
    if (escrow) {
      try {
        // Call the releaseFunds function as the escrow agent
        const tx = await escrow.releaseFunds();
        await tx.wait();
        alert("Funds released to seller!");
      } catch (error) {
        console.error("Error releasing funds:", error);
        alert("Failed to release funds.");
      }
    }
  };

  const refundBuyer = async () => {
    if (escrow) {
      try {
        // Call the refundBuyer function as the escrow agent
        const tx = await escrow.refundBuyer();
        await tx.wait();
        alert("Funds refunded to buyer!");
      } catch (error) {
        console.error("Error refunding buyer:", error);
        alert("Failed to refund buyer.");
      }
    }
  };

  return (
    <div className="App">
      <h1>Escrow DApp (Local)</h1>
      <button onClick={deposit}>Deposit 10 ETH</button>
      <button onClick={releaseFunds}>Release Funds</button>
      <button onClick={refundBuyer}>Refund Buyer</button>
    </div>
  );
}

export default App;