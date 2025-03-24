pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlatformNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    string private _baseTokenURI;

    constructor(string memory baseURI) ERC721("PlatformNFT", "PNFT") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        _tokenIdCounter = 0;
    }

    // Mint a new NFT to a specified address
    function mint(address to) public onlyOwner returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        _mint(to, tokenId);
        return tokenId;
    }

    // Override the baseURI function to return the base URI
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // Update the base URI
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    // Get the total supply of minted NFTs
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
}