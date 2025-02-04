"use client"

import { useState, useEffect } from "react";
import { JsonRpcProvider, Contract, ethers, Wallet } from "ethers";

// Replace with your local node's RPC URL
const LOCAL_RPC_URL = "http://localhost:8545";
const ESCROW_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
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

function App() {
  const [provider, setProvider] = useState<JsonRpcProvider | null>(null);
  const [signer, setSigner] = useState<Wallet | null>(null);
  const [escrow, setEscrow] = useState<Contract | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize provider
        const provider = new JsonRpcProvider(LOCAL_RPC_URL);

        // Use a private key from your local node (e.g., from Ganache or Hardhat)
        const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Replace with your local account's private key
        const signer = new Wallet(privateKey, provider);

        // Initialize contract
        const contract = new Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

        // Update state
        setProvider(provider);
        setSigner(signer);
        setEscrow(contract);
      } catch (error) {
        console.error("Error initializing provider or signer:", error);
      }
    };
    init();
  }, []);

  const deposit = async () => {
    if (escrow) {
      try {
        const tx = await escrow.deposit({ value: ethers.parseEther("1") });
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
        // Ensure the connected wallet is the escrowAgent
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        const escrowAgentAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Replace with your escrowAgent address
  
        if (accounts[0].toLowerCase() !== escrowAgentAddress.toLowerCase()) {
          alert("Only the escrow agent can refund the buyer.");
          return;
        }
  
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
      <button onClick={deposit}>Deposit 1 ETH</button>
      <button onClick={releaseFunds}>Release Funds</button>
      <button onClick={refundBuyer}>Refund Buyer</button>
    </div>
  );
}

export default App;