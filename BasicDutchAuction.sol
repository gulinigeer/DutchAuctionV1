// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
 
import "@openzeppelin/contracts/access/Ownable.sol";
import "https://github.com/AmazingAng/WTFSolidity/blob/main/34_ERC721/ERC721.sol";
 
contract DutchAuction is Ownable, ERC721 {
    uint256 public constant COLLECTOIN_SIZE = 10000; // Total NFT
    uint256 public constant AUCTION_START_PRICE = 1 ether; // Starting price (highest price)
    uint256 public constant AUCTION_END_PRICE = 0.1 ether; // End price (minimum price / floor price)
    uint256 public constant AUCTION_TIME = 10 minutes; // auction time, set to 10 minutes for testing convenience
    uint256 public constant AUCTION_DROP_INTERVAL = 1 minutes; // how long after each time, the price decayed once
    uint256 public constant AUCTION_DROP_PER_STEP =
        (AUCTION_START_PRICE - AUCTION_END_PRICE) /
        (AUCTION_TIME / AUCTION_DROP_INTERVAL); // each price decay step
    
    uint256 public auctionStartTime; // Auction start timestamp
    string private _baseTokenURI;   // metadata URI
    uint256[] private _allTokens; // record all existing tokenId  

    constructor() ERC721("WTF Dutch Auctoin", "WTF Dutch Auctoin") {
        auctionStartTime = block.timestamp;
    }
 
    // auctionStartTime setter function，onlyOwner
    function setAuctionStartTime(uint32 timestamp) external onlyOwner {
        auctionStartTime = timestamp;
    }

    // Get the real-time auction price
    function getAuctionPrice()
        public
        view
        returns (uint256)
    {
        if (block.timestamp < auctionStartTime) {
        return AUCTION_START_PRICE;
        }else if (block.timestamp - auctionStartTime >= AUCTION_TIME) {
        return AUCTION_END_PRICE;
        } else {
        uint256 steps = (block.timestamp - auctionStartTime) /
            AUCTION_DROP_INTERVAL;
        return AUCTION_START_PRICE - (steps * AUCTION_DROP_PER_STEP);
        }
    }

    // The auction mint function
    function auctionMint(uint256 quantity) external payable{
        uint256 _saleStartTime = uint256(auctionStartTime); //  create local variables to reduce gas spend
        require(
        _saleStartTime != 0 && block.timestamp >= _saleStartTime,
        "sale has not started yet"
        ); // check if the start time is set and the auction starts
        require(
        totalSupply() + quantity <= COLLECTOIN_SIZE,
        "not enough remaining reserved for auction to support desired mint amount"
        ); // check if the NFT limit is exceeded
 
        uint256 totalCost = getAuctionPrice() * quantity; // Calculate mint cost
        require(msg.value >= totalCost, "Need to send more ETH."); // check if user paid enough ETH
        
        // Mint NFT
        for(uint256 i = 0; i < quantity; i++) {
            uint256 mintIndex = totalSupply();
            _mint(msg.sender, mintIndex);
            _addTokenToAllTokensEnumeration(mintIndex);
        }
        // refund excess ETH
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost); //Note if there is a risk of re-entry here
        }
    }

    // Withdrawal function, onlyOwner
    function withdrawMoney() external onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}(""); // call函数的调用方式详见第22讲
        require(success, "Transfer failed.");
    }

}