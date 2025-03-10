pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TradingContract {
    IERC20 public simToken;
    uint256 public tokenPrice = 1; // 1 token = 1 ETH
    address public owner;
    mapping(address => uint256) public ethBalances;
    mapping(address => uint256) public tokenBalances;

    constructor(address _simToken) {
        simToken = IERC20(_simToken);
        owner = msg.sender;
    }

    function depositETH() external payable {
        require(msg.value > 0, "Must deposit some ETH");
        ethBalances[msg.sender] += msg.value;
    }

    function depositTokens(uint256 amount) external {
        require(amount > 0, "Must deposit some tokens");
        require(
            simToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        tokenBalances[msg.sender] += amount;
    }

    function withdrawETH(uint256 amount) external {
        require(amount > 0, "Must withdraw some ETH");
        require(ethBalances[msg.sender] >= amount, "Insufficient ETH balance");
        ethBalances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function withdrawTokens(uint256 amount) external {
        require(
            tokenBalances[msg.sender] >= amount,
            "Insufficient token balance"
        );
        require(
            simToken.balanceOf(address(this)) >= amount,
            "Contract lacks sufficient tokens"
        );
        tokenBalances[msg.sender] -= amount;
        simToken.transfer(msg.sender, amount);
    }

    function buyTokens(uint256 amount) external payable {
        uint256 cost = amount * tokenPrice; // 1 ETH per token
        require(msg.value >= cost * 1 ether, "Insufficient ETH sent");
        require(
            simToken.balanceOf(address(this)) >= amount * 1 ether,
            "Insufficient token supply"
        );
        tokenBalances[msg.sender] += amount * 1 ether;
    }

    function sellTokens(uint256 amount) external {
        uint256 payout = amount * tokenPrice;
        require(
            tokenBalances[msg.sender] >= amount * 1 ether,
            "Insufficient token balance"
        );
        require(
            address(this).balance >= payout * 1 ether,
            "Contract lacks ETH"
        );
        tokenBalances[msg.sender] -= amount * 1 ether;
        payable(msg.sender).transfer(payout * 1 ether); // Send ETH directly
    }

    function getBalances(
        address user
    ) external view returns (uint256 ethBalance, uint256 tokenBalance) {
        return (ethBalances[user], tokenBalances[user]);
    }

    function setTokenPrice(uint256 newPrice) external {
        require(msg.sender == owner, "Not owner");
        tokenPrice = newPrice;
    }

    receive() external payable {}
}
