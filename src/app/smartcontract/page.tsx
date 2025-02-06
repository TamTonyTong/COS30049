"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
const CryptoEscrowABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_buyer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_seller",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_ethAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_eth1Amount",
        "type": "uint256"
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
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "currency",
        "type": "string"
      }
    ],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "currency",
        "type": "string"
      }
    ],
    "name": "Refund",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ethAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "eth1Amount",
        "type": "uint256"
      }
    ],
    "name": "TradeCompleted",
    "type": "event"
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
    "name": "buyerDeposited",
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
    "name": "completeTrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "confirmUSDReceived",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "depositETH",
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
    "name": "eth1Amount",
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
    "name": "ethAmount",
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
    "name": "refundBuyer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "restartTrade",
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
  },
  {
    "inputs": [],
    "name": "sellerDeposited",
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
    "name": "tradeCompleted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with actual contract address
const escrowAgent = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace with actual escrow agent address
const buyer = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const seller = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

export default function Home() {
  const [account, setAccount] = useState(null);
  const [escrowContract, setEscrowContract] = useState(null);
  const [ethAmount, setEthAmount] = useState("0");
  const [eth1Amount, setEth1Amount] = useState("0");
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.request({ method: "eth_accounts" }).then(handleAccounts);
    }
  }, []);

  async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        handleAccounts(accounts);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    }
  }

  function handleAccounts(accounts) {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setupContract();
    }
  }

  async function setupContract() {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        CryptoEscrowABI,
        signer
      );
      setEscrowContract(contract);
      updateContractDetails(contract);
    } catch (error) {
      console.error("Error setting up contract:", error);
    }
  }

  async function updateContractDetails(contract) {
    try {
      const eth = await contract.ethAmount();
      const eth1 = await contract.eth1Amount();
      setEthAmount(ethers.formatEther(eth));
      setEth1Amount(ethers.formatEther(eth1));
      setStatus("Ready");
    } catch (error) {
      console.error("Error updating contract details:", error);
    }
  }

  async function depositETH() {
    if (!escrowContract) return;
    try {
      const tx = await escrowContract.depositETH({
        value: ethers.parseEther(ethAmount),
      });
      await tx.wait();
      alert("ETH Deposited!");
    } catch (error) {
      console.error("Error depositing ETH:", error);
    }
  }

  async function confirmUSD() {
    if (!escrowContract) return;
    try {
      // const tx = await escrowContract.confirmUSDReceived();
      const tx = await escrowContract.confirmUSDReceived({
        value: ethers.parseEther(eth1Amount),
      });
      await tx.wait();
      alert("USD Payment Confirmed!");
    } catch (error) {
      console.error("Error confirming USD:", error);
    }
  }

  async function releaseFunds() {
    if (!escrowContract) {
      alert("Contract not loaded!");
      return;
    }

    // Convert addresses to checksum format for accurate comparison
    const checksumAccount = ethers.getAddress(account);
    const checksumEscrowAgent = ethers.getAddress(escrowAgent);

    console.log("Account:", checksumAccount);
    console.log("Escrow Agent:", checksumEscrowAgent);

    if (checksumAccount !== checksumEscrowAgent) {
      alert("Only escrow agent can release funds!");
      return;
    }

    try {
      const tx = await escrowContract.completeTrade();
      await tx.wait();
      alert("Funds Released!");
    } catch (error) {
      console.error("Error releasing funds:", error);
      alert("Failed to release funds. Check console for details.");
    }
  }
  console.log(buyer);
  console.log("The seller:", seller)
  console.log(escrowAgent);
  console.log(escrowContract);
  console.log("The account is", account)

  async function restartTrade() {
    if (!escrowContract) return;
    try {
      const tx = await escrowContract.restartTrade();
      await tx.wait();
      alert("Trade Restarted!");
      // Reset state if needed, or update contract details again
      updateContractDetails(escrowContract);
    } catch (error) {
      console.error("Error restarting trade:", error);
    }
  }
  return (
    <div className="p-6 max-w-md mx-auto bg-transparent rounded-xl shadow-md space-y-4">
      <h1 className="text-xl font-bold">Crypto Escrow</h1>
      <p>Status: {status}</p>
      <p>Connected Wallet: {account || "Not Connected"}</p>
      <button
        onClick={connectWallet}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Connect Wallet
      </button>
      <p>ETH Required: {ethAmount} ETH</p>
      <p>ETH1 Required: {eth1Amount} ETH1</p>
      <button
        onClick={depositETH}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Deposit ETH
      </button>

      <button
        onClick={confirmUSD}
        className="px-4 py-2 bg-yellow-500 text-white rounded"
      >
        Confirm USD Payment
      </button>
      <button
        onClick={releaseFunds}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Release Funds
      </button>

      <button
          onClick={restartTrade}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Restart Trade
        </button>
      {account === buyer && (
        <button
          onClick={depositETH}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Deposit ETH
        </button>
      )}
      {account === seller && (
        <button
          onClick={confirmUSD}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Confirm USD Payment
        </button>
      )}
      {account === escrowAgent && (
        <button
          onClick={releaseFunds}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Release Funds
        </button>
      )}
      {/* New restart button */}
      {account === escrowAgent && (
        <button
          onClick={restartTrade}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Restart Trade
        </button>)}
    </div>
  );
}
