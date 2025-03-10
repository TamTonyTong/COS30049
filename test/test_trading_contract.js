const { expect } = require("chai");
const hre = require("hardhat");
const { parseEther } = require("ethers");

describe("TradingContract", function () {
  let SimToken, TradingContract, simToken, tradingContract, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await hre.ethers.getSigners();

    console.log("Owner address:", owner.address);
    console.log("Using network:", hre.network.name);

    console.log(
      "Owner balance:",
      hre.ethers.formatEther(
        await hre.ethers.provider.getBalance(owner.address)
      )
    );

    SimToken = await hre.ethers.getContractFactory("SimToken");
    simToken = await SimToken.deploy(parseEther("1000000"));
    console.log("SimToken address:", simToken.target);
    await simToken.waitForDeployment();

    TradingContract = await hre.ethers.getContractFactory("TradingContract");
    tradingContract = await TradingContract.deploy(simToken.target);
    await tradingContract.waitForDeployment();
    console.log("TradingContract address:", tradingContract.target);
    await owner.sendTransaction({
      to: tradingContract.target,
      value: parseEther("50"),
    });
    await simToken.transfer(tradingContract.target, parseEther("500000"));
    await simToken.transfer(addr1.address, parseEther("200"));
  });

  it("should allow depositing and buying tokens", async function () {
    await simToken
      .connect(addr1)
      .approve(tradingContract.target, parseEther("100"));
    await tradingContract.connect(addr1).depositTokens(parseEther("100"));
    const [ethBal1, tokenBal1] = await tradingContract.getBalances(
      addr1.address
    );
    expect(hre.ethers.formatEther(ethBal1)).to.equal("0.0");
    expect(hre.ethers.formatEther(tokenBal1)).to.equal("100.0");

    await tradingContract
      .connect(addr1)
      .depositETH({ value: parseEther("20") });
    await tradingContract.connect(addr1).buyTokens(BigInt(10));
    const [ethBal2, tokenBal2] = await tradingContract.getBalances(
      addr1.address
    );
    expect(hre.ethers.formatEther(ethBal2)).to.equal("10.0");
    expect(hre.ethers.formatEther(tokenBal2)).to.equal("110.0");
  });

  it("should allow selling and withdrawing", async function () {
    await simToken
      .connect(addr1)
      .approve(tradingContract.target, parseEther("100"));
    await tradingContract.connect(addr1).depositTokens(parseEther("100"));
    await tradingContract
      .connect(addr1)
      .depositETH({ value: parseEther("20") });

    await tradingContract.connect(addr1).sellTokens(BigInt(50));
    const [ethBal, tokenBal] = await tradingContract.getBalances(addr1.address);
    expect(hre.ethers.formatEther(ethBal)).to.equal("20.0"); // Unchanged after direct transfer
    expect(hre.ethers.formatEther(tokenBal)).to.equal("50.0");

    await tradingContract.connect(addr1).withdrawETH(parseEther("10")); // Reduced withdrawal
    const addr1Balance = await hre.ethers.provider.getBalance(addr1.address);

    await tradingContract.connect(addr1).withdrawTokens(parseEther("50"));
    expect(
      hre.ethers.formatEther(await simToken.balanceOf(addr1.address))
    ).to.equal("150.0");
  });
});
