const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
  let Escrow, escrow;
  let buyer, seller, escrowAgent;

  beforeEach(async function () {
    [buyer, seller, escrowAgent] = await ethers.getSigners();
    Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(seller.address, escrowAgent.address);
    await escrow.waitForDeployment();
  });

  it("Should deposit funds", async function () {
    await escrow.connect(buyer).deposit({ value: ethers.parseEther("1") });
    expect(await escrow.amount()).to.equal(ethers.parseEther("1"));
  });

  it("Should release funds to seller", async function () {
    await escrow.connect(buyer).deposit({ value: ethers.parseEther("1") });
    await escrow.connect(escrowAgent).releaseFunds();
    expect(await escrow.isCompleted()).to.be.true;
  });

  it("Should refund buyer", async function () {
    await escrow.connect(buyer).deposit({ value: ethers.parseEther("1") });
    await escrow.connect(escrowAgent).refundBuyer();
    expect(await escrow.isCompleted()).to.be.true;
  });
});