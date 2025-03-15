pragma solidity ^0.8.20;

contract TradingContract {
    address public owner;

    // Event to log trade details
    event TradeInitiated(address indexed sender, address indexed recipient, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    // Initiate a trade and transfer ETH to the recipient
    function initiateTrade(address payable recipient, uint256 amount) external payable {
        require(msg.value == amount, "Incorrect ETH amount sent");
        require(recipient != address(0), "Invalid recipient address");
        recipient.transfer(amount);
        emit TradeInitiated(msg.sender, recipient, amount);
    }

    // Allow contract to receive ETH
    receive() external payable {}
}