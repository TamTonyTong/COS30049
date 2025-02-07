class FakeSmartContract {
    private trades: any[] = [];
  
    constructor() {
      this.loadTrades();
    }
  
    private loadTrades() {
      const savedTrades = localStorage.getItem("fake_trades");
      this.trades = savedTrades ? JSON.parse(savedTrades) : [];
    }
  
    private saveTrades() {
      localStorage.setItem("fake_trades", JSON.stringify(this.trades));
    }
  
    public executeTrade(buyer: string, seller: string, asset: string, amount: number, price: number) {
      const fakeTxHash = "0x" + Math.random().toString(16).substr(2, 64);
      
      const newTrade = {
        txHash: fakeTxHash,
        buyer,
        seller,
        asset,
        amount,
        price,
        timestamp: new Date().toISOString(),
      };
  
      this.trades.push(newTrade);
      this.saveTrades();
  
      return newTrade;
    }
  
    public getTradeHistory() {
      return this.trades;
    }
  
    public getBalance(address: string) {
      // Fake balance logic (randomized for now)
      return Math.floor(Math.random() * 10000);
    }
  }
  
  export const fakeSmartContract = new FakeSmartContract();  