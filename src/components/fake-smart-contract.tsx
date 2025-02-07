class FakeSmartContract {
  private trades: any[] = [];
  private balances: { [key: string]: number } = { UserA: 1000, UserB: 1000 }; // Fake USD balances

  constructor() {
    this.loadTrades();
    this.loadBalances();
  }

  private loadTrades() {
    const savedTrades = localStorage.getItem("fake_trades");
    this.trades = savedTrades ? JSON.parse(savedTrades) : [];
  }

  private saveTrades() {
    localStorage.setItem("fake_trades", JSON.stringify(this.trades));
  }

  private loadBalances() {
    const savedBalances = localStorage.getItem("fake_balances");
    this.balances = savedBalances ? JSON.parse(savedBalances) : this.balances;
  }

  private saveBalances() {
    localStorage.setItem("fake_balances", JSON.stringify(this.balances));
  }

  public depositUSD(user: string, amount: number) {
    this.balances[user] = (this.balances[user] || 0) + amount;
    this.saveBalances();
  }

  public initiateTrade(buyer: string, seller: string, asset: string, amount: number, price: number) {
    if (this.balances[buyer] < price * amount) {
      return { error: "Insufficient USD balance." };
    }

    const fakeTxHash = "0x" + Math.random().toString(16).substr(2, 64);
    
    const newTrade = {
      txHash: fakeTxHash,
      buyer,
      seller,
      asset,
      amount,
      price,
      status: "Pending Seller Deposit",
      timestamp: new Date().toISOString(),
    };

    this.trades.push(newTrade);
    this.saveTrades();

    return newTrade;
  }

  public sellerDepositSCM(txHash: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const trade = this.trades.find((t) => t.txHash === txHash);
        if (trade) {
          trade.status = "Pending Trade Completion";
          this.saveTrades();
        }
        resolve(trade);
      }, 3000); // Simulating delay
    });
  }

  public completeTrade(txHash: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const trade = this.trades.find((t) => t.txHash === txHash);
        if (trade) {
          this.balances[trade.buyer] -= trade.price * trade.amount;
          this.balances[trade.seller] += trade.price * trade.amount;

          trade.status = "Trade Completed";
          this.saveTrades();
          this.saveBalances();
        }
        resolve(trade);
      }, 5000); // Simulating trade completion delay
    });
  }

  public getBalance(address: string) {
    return this.balances[address] || 0;
  }

  public getTradeHistory() {
    return this.trades;
  }
}

export const fakeSmartContract = new FakeSmartContract();
