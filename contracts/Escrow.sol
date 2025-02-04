// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {
    // Addresses
    address public buyer; // The buyer is the one who deploys the contract
    address public seller; // The seller's address (passed as a parameter)
    address public escrowAgent; // The escrow agent's address (passed as a parameter)

    // State variables
    uint256 public amount; // Amount of ETH held in escrow
    bool public isFunded; // Whether the escrow is funded
    bool public isCompleted; // Whether the escrow is completed

    // Events
    event Deposited(address indexed buyer, uint256 amount);
    event Released(address indexed seller, uint256 amount);
    event Refunded(address indexed buyer, uint256 amount);

    // Constructor
    constructor(address _seller, address _escrowAgent) {
        buyer = msg.sender; // The buyer is the one deploying the contract
        seller = _seller; // Seller's address (passed as a parameter)
        escrowAgent = _escrowAgent; // Escrow agent's address (passed as a parameter)
        isFunded = false;
        isCompleted = false;
    }

    // Deposit function (only buyer can call)
    function deposit() external payable {
        require(msg.sender == buyer, "Only the buyer can deposit funds.");
        require(msg.value > 0, "You must send some ETH.");
        require(!isFunded, "Escrow is already funded.");

        amount = msg.value;
        isFunded = true;
        emit Deposited(msg.sender, msg.value);
    }

    // Release funds to the seller (only escrow agent can call)
    function releaseFunds() external {
        require(msg.sender == escrowAgent, "Only the escrow agent can release funds.");
        require(isFunded, "Escrow is not funded.");
        require(!isCompleted, "Escrow is already completed.");

        isCompleted = true;
        payable(seller).transfer(amount);
        emit Released(seller, amount);
    }

    // Refund funds to the buyer (only escrow agent can call)
    function refundBuyer() external {
        require(msg.sender == escrowAgent, "Only the escrow agent can refund the buyer.");
        require(isFunded, "Escrow is not funded.");
        require(!isCompleted, "Escrow is already completed.");

        isCompleted = true;
        payable(buyer).transfer(amount);
        emit Refunded(buyer, amount);
    }

    // Fallback function to accept ETH
    receive() external payable {}
}