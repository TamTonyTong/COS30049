import { useState, useEffect } from "react";
import { fakeSmartContract } from "@/components/fake-smart-contract";

const TradingForm = () => {
  const [asset, setAsset] = useState("");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [tradeResult, setTradeResult] = useState(null);
  const [status, setStatus] = useState("");
  const [balances, setBalances] = useState({ USD: 0, SCM: 0 });
  const [sellerDeposit, setSellerDeposit] = useState(0);

  useEffect(() => {
    updateBalance();
  }, []);

  const updateBalance = () => {
    setBalances(fakeSmartContract.getBalance("UserA"));
  };

  const handleDepositUSD = () => {
    fakeSmartContract.depositUSD("UserA", Number(depositAmount));
    updateBalance();
    alert(`Deposited $${depositAmount} to UserA's balance.`);
  };

  const handleTrade = async () => {
    setStatus("Initiating trade...");
    const trade = fakeSmartContract.initiateTrade("UserA", "UserB", asset, Number(amount), Number(price));

    if (trade.error) {
      alert(trade.error);
      return;
    }

    setTradeResult(trade);
    setStatus("Waiting for seller to deposit SCM...");

    const updatedTrade = await fakeSmartContract.sellerDepositSCM(trade.txHash);
    setSellerDeposit(updatedTrade.sellerDeposit);
    setStatus("Seller deposited SCM. Completing trade...");

    await fakeSmartContract.completeTrade(trade.txHash);
    updateBalance();
    setStatus("Trade completed! Buyer received SCM, Seller received USD.");
  };

  return (
    <div>
      <h2>Balance</h2>
      <p className="bg-transparent">USD Balance: ${balances.USD}</p>
      <p>SCM Balance: {balances.SCM} SCM</p>

      <h2>Deposit USD</h2>
      <input className="bg-transparent" placeholder="Deposit Amount" type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
      <button onClick={handleDepositUSD}>Deposit</button>

      <h2>Trade Assets</h2>
      <input placeholder="Asset" value={asset} onChange={(e) => setAsset(e.target.value)} />
      <input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
      <button onClick={handleTrade}>Execute Trade</button>

      {status && <p>Status: {status}</p>}
      {tradeResult && <p>Seller Deposited: {sellerDeposit} SCM</p>}
    </div>
  );
};

export default TradingForm;
