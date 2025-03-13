pragma solidity ^0.8.20;

contract TradingContract {
    address public owner;
    mapping(bytes32 => uint256) public trades; // tradeId => ETH amount

    event TradeInitiated(address indexed sender, address indexed recipient, uint256 amount, bytes32 tradeId);
    event TradeAccepted(address indexed sender, address indexed recipient, uint256 amount, bytes32 tradeId);

    constructor() {
        owner = msg.sender;
    }

    // Initiate a trade by sending ETH to the contract
    function initiateTrade(address recipient, uint256 amount) external payable {
        require(msg.value == amount, "Incorrect ETH amount sent");
        require(recipient != address(0), "Invalid recipient address");
        bytes32 tradeId = keccak256(abi.encodePacked(msg.sender, recipient, amount));
        require(trades[tradeId] == 0, "Trade already exists");
        trades[tradeId] = amount;
        emit TradeInitiated(msg.sender, recipient, amount, tradeId);
    }

    // Accept a trade and receive the ETH
    function acceptTrade(address sender, uint256 amount) external {
        bytes32 tradeId = keccak256(abi.encodePacked(sender, msg.sender, amount));
        uint256 tradeAmount = trades[tradeId];
        require(tradeAmount > 0, "No such trade exists");
        trades[tradeId] = 0; // Clear the trade
        payable(msg.sender).transfer(tradeAmount);
        emit TradeAccepted(sender, msg.sender, tradeAmount, tradeId);
    }

    // Allow contract to receive ETH
    receive() external payable {}
}