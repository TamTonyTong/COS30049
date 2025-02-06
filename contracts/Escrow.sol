// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CryptoEscrow {
    address public escrowAgent;
    address public buyer;
    address public seller;
    uint256 public ethAmount;
    uint256 public eth1Amount;
    bool public buyerDeposited;
    bool public sellerDeposited;
    bool public tradeCompleted;

    event Deposit(address indexed user, uint256 amount, string currency);
    event TradeCompleted(address buyer, address seller, uint256 ethAmount, uint256 eth1Amount);
    event Refund(address indexed user, uint256 amount, string currency);

    modifier onlyEscrowAgent() {
        require(msg.sender == escrowAgent, "Only escrow agent can perform this action");
        _;
    }

    modifier tradeNotCompleted() {
        require(!tradeCompleted, "Trade already completed");
        _;
    }

    constructor(address _buyer, address _seller, uint256 _ethAmount, uint256 _eth1Amount) {
        escrowAgent = msg.sender;
        buyer = _buyer;
        seller = _seller;
        ethAmount = _ethAmount;
        eth1Amount = _eth1Amount;
    }

    function depositETH() external payable tradeNotCompleted {
        require(msg.sender == buyer, "Only buyer can deposit ETH");
        require(msg.value == ethAmount, "Incorrect ETH amount");
        buyerDeposited = true;
        emit Deposit(msg.sender, msg.value, "ETH");
    }

    function confirmUSDReceived() external payable tradeNotCompleted {
        require(msg.sender == seller, "Only seller can confirm USD receipt");
        require(msg.value == eth1Amount, "Incorrect ETH amount");
        sellerDeposited = true;
        emit Deposit(msg.sender, msg.value, "ETH");
    }

    function completeTrade() external onlyEscrowAgent tradeNotCompleted {
        require(buyerDeposited && sellerDeposited, "Both parties must deposit");
        payable(seller).transfer(ethAmount);
        payable(buyer).transfer(eth1Amount);
        tradeCompleted = true;
        emit TradeCompleted(buyer, seller, ethAmount, eth1Amount);
    }

    function refundBuyer() external onlyEscrowAgent tradeNotCompleted {
        require(buyerDeposited && !sellerDeposited, "Refund only if seller hasn't confirmed USD");
        payable(buyer).transfer(ethAmount);
        buyerDeposited = false;
        emit Refund(buyer, ethAmount, "ETH");
    }
    
    function restartTrade() external onlyEscrowAgent {
        require(tradeCompleted, "Trade must be completed to restart");

        // Resetting the state variables
        buyerDeposited = false;
        sellerDeposited = false;
        tradeCompleted = false;
    }
}
