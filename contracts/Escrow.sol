// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CryptoEscrow {
    address public escrowAgent;
    address public buyer;
    address public seller;
    uint256 public ethAmount;
    uint256 public usdAmount;
    bool public buyerDeposited;
    bool public sellerDeposited;
    bool public tradeCompleted;

    event Deposit(address indexed user, uint256 amount, string currency);
    event TradeCompleted(address buyer, address seller, uint256 ethAmount, uint256 usdAmount);
    event Refund(address indexed user, uint256 amount, string currency);

    modifier onlyEscrowAgent() {
        require(msg.sender == escrowAgent, "Only escrow agent can perform this action");
        _;
    }

    modifier tradeNotCompleted() {
        require(!tradeCompleted, "Trade already completed");
        _;
    }

    constructor(address _buyer, address _seller, uint256 _ethAmount, uint256 _usdAmount) {
        escrowAgent = msg.sender;
        buyer = _buyer;
        seller = _seller;
        ethAmount = _ethAmount;
        usdAmount = _usdAmount;
    }

    function depositETH() external payable tradeNotCompleted {
        require(msg.sender == buyer, "Only buyer can deposit ETH");
        require(msg.value == ethAmount, "Incorrect ETH amount");
        buyerDeposited = true;
        emit Deposit(msg.sender, msg.value, "ETH");
    }

    function confirmUSDReceived() external tradeNotCompleted {
        require(msg.sender == seller, "Only seller can confirm USD receipt");
        sellerDeposited = true;
        emit Deposit(msg.sender, usdAmount, "USD");
    }

    function completeTrade() external onlyEscrowAgent tradeNotCompleted {
        require(buyerDeposited && sellerDeposited, "Both parties must deposit");
        payable(seller).transfer(ethAmount);
        tradeCompleted = true;
        emit TradeCompleted(buyer, seller, ethAmount, usdAmount);
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
