import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

// const ESCROW_CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
// const ESCROW_ABI = [
//   // Insert your contract ABI here (found in artifacts/contracts/Escrow.sol/Escrow.json)
// ];

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [escrow, setEscrow] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

        setProvider(provider);
        setSigner(signer);
        setEscrow(contract);
      }
    };
    init();
  }, []);

  const deposit = async () => {
    if (escrow) {
      const tx = await escrow.deposit({ value: ethers.utils.parseEther("1") });
      await tx.wait();
      alert("Funds deposited!");
    }
  };

  const releaseFunds = async () => {
    if (escrow) {
      const tx = await escrow.releaseFunds();
      await tx.wait();
      alert("Funds released to seller!");
    }
  };

  const refundBuyer = async () => {
    if (escrow) {
      const tx = await escrow.refundBuyer();
      await tx.wait();
      alert("Funds refunded to buyer!");
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