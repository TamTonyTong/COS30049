// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {
    address public buyer;
    address public seller;
    address public escrowAgent;
    uint256 public amount;
    bool public isFunded;
    bool public isCompleted;

    event Deposited(address indexed buyer, uint256 amount);
    event Released(address indexed seller, uint256 amount);
    event Refunded(address indexed buyer, uint256 amount);

    constructor(address _seller, address _escrowAgent) {
        buyer = msg.sender;
        seller = _seller;
        escrowAgent = _escrowAgent;
        isFunded = false;
        isCompleted = false;
    }

    function deposit() external payable {
        require(msg.sender == buyer, "Only buyer can deposit");
        require(msg.value > 0, "Must send ETH");
        require(!isFunded, "Already funded");

        amount = msg.value;
        isFunded = true;
        emit Deposited(msg.sender, msg.value);
    }

    function releaseFunds() external {
        require(msg.sender == escrowAgent, "Only escrow agent can release funds");
        require(isFunded, "Funds not deposited");
        require(!isCompleted, "Transaction already completed");

        isCompleted = true;
        payable(seller).transfer(amount);
        emit Released(seller, amount);
    }

    function refundBuyer() external {
        require(msg.sender == escrowAgent, "Only escrow agent can refund");
        require(isFunded, "Funds not deposited");
        require(!isCompleted, "Transaction already completed");

        isCompleted = true;
        payable(buyer).transfer(amount);
        emit Refunded(buyer, amount);
    }
}
