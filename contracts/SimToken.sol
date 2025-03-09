pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("SimToken", "SIM") {
        _mint(msg.sender, initialSupply);
    }
}
