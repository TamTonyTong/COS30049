/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
class FakeSmartContract {
  private trades: any[] = [];
  private balances: { [key: string]: { USD: number; BTC: number } } = {
    UserA: { USD: 0, BTC: 0 },
    UserB: { USD: 1000, BTC: 500 }, // Seller starts with 500 BTC
  };

  constructor() {
    this.loadTrades();
    this.loadBalances();
  }

  public getTradeHistory() {
    return this.trades;
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
    try {
      const parsedBalances = savedBalances ? JSON.parse(savedBalances) : null;

      if (parsedBalances && typeof parsedBalances === "object" && parsedBalances.UserA) {
        this.balances = parsedBalances;
      } else {
        this.balances = {
          UserA: { USD: 1000, BTC: 0 },
          UserB: { USD: 1000, BTC: 500 }, // Seller starts with 500 BTC
        };
        this.saveBalances(); // Save correct structure to localStorage
      }
    } catch (error) {
      console.error("Failed to load balances, resetting to default:", error);
      this.balances = {
        UserA: { USD: 1000, BTC: 0 },
        UserB: { USD: 1000, BTC: 500 },
      };
      this.saveBalances();
    }
  }

  private saveBalances() {
    localStorage.setItem("fake_balances", JSON.stringify(this.balances));
  }

  public resetUSDBalance(user: string) {
    if (this.balances[user]) {
      this.balances[user].USD = 0;
      this.saveBalances();
      console.log("Balance reset for", user, this.balances[user]); // Debugging
    }
  }
  public depositUSD(user: string, amount: number) {
    // Ensure the user has a balance object before modifying it
    if (!this.balances[user] || typeof this.balances[user] !== "object") {
      this.balances[user] = { USD: 0, BTC: 0 }; // Initialize user balance
    }

    this.balances[user].USD += amount;
    this.saveBalances();
  }


  public getBalance(user: string) {
    return this.balances[user];
  }

  public initiateTrade(buyer: string, seller: string, asset: string, amount: number, price: number) {
    if (this.balances[buyer].USD < price * amount) {
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
      sellerDeposit: 0,
      status: "Pending Seller Deposit",
      timestamp: new Date().toISOString(),
    };

    this.trades.push(newTrade);
    this.saveTrades();

    return newTrade;
  }

  public sellerDepositBTC(txHash: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const trade = this.trades.find((t) => t.txHash === txHash);
        // if (trade && this.balances[trade.seller].BTC >= trade.amount) {
        //   this.balances[trade.seller].BTC -= trade.amount;
        //   trade.sellerDeposit = trade.amount;
        //   trade.status = "Pending Trade Completion";
        //   this.saveTrades();
        //   this.saveBalances();
        // }

        this.balances[trade.seller].BTC -= trade.amount;
        trade.sellerDeposit = trade.amount;
        trade.status = "Pending Trade Completion";
        this.saveTrades();
        this.saveBalances();

        resolve(trade);
      }, 3000);
    });
  }

  public completeTrade(txHash: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const trade = this.trades.find((t) => t.txHash === txHash);
        if (trade) {
          this.balances[trade.buyer].USD -= trade.price * trade.amount;
          this.balances[trade.seller].USD += trade.price * trade.amount;
          this.balances[trade.buyer].BTC += trade.amount;

          trade.status = "Trade Completed";
          this.saveTrades();
          this.saveBalances();
        }
        resolve(trade);
      }, 5000);
    });
  }
}

export const fakeSmartContract = new FakeSmartContract();
