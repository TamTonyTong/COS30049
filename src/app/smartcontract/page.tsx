"use client"

import { useState, useEffect } from "react";
import { BrowserProvider, Contract, ethers, JsonRpcSigner } from "ethers";

const ESCROW_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ESCROW_ABI = [
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
  // Insert your contract ABI here (found in artifacts/contracts/Escrow.sol/Escrow.json)
];

function App() {
  // Define types for provider, signer, and escrow
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [escrow, setEscrow] = useState<Contract | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask or another Ethereum wallet.");
        return;
      }

      try {
        // Initialize provider
        const provider = new BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Get signer
        const signer = await provider.getSigner();

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
        // Use `ethers.parseEther` instead of `ethers.utils.parseEther`
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
      <h1>Escrow DApp</h1>
      <button onClick={deposit}>Deposit 1 ETH</button>
      <button onClick={releaseFunds}>Release Funds</button>
      <button onClick={refundBuyer}>Refund Buyer</button>
    </div>
  );
}

export default App;