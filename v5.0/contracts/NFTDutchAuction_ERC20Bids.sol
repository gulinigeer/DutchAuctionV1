// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
//Extend the IERC721 contract interface to use the ERC721 methods in this contract, we will need them for use with our NFT.

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

contract NFTDutchAuction_ERC20Bids is Initializable, UUPSUpgradeable{
    IERC721 public nft;
    uint256 public nftId;
    IERC20  public coin;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    address public owner;
    uint256 public lastBlockNumber;
    uint256 public initialPrice;
    bool public ended;

    event AuctionEnded(address winner, uint256 amount);

    // The auction has already ended.
    error AuctionAlreadyEnded();
    // The auction has not ended yet.
    error AuctionNotYetEnded();

    function initialize(
        address erc20TokenAddress,
        address erc721TokenAddress,
        uint256 _nftTokenId,
        uint256 _reservePrice, 
        uint256 _numBlocksAuctionOpen, 
        uint256 _offerPriceDecrement) initializer public {
            reservePrice = _reservePrice;
            numBlocksAuctionOpen = _numBlocksAuctionOpen;
            offerPriceDecrement = _offerPriceDecrement;
            owner = msg.sender;
            lastBlockNumber = block.number + numBlocksAuctionOpen;
            initialPrice = reservePrice + numBlocksAuctionOpen * offerPriceDecrement;
            ended = false;
            nft = IERC721(erc721TokenAddress);
            nftId = _nftTokenId;
            coin = IERC20(erc20TokenAddress);

    }
    
    function _authorizeUpgrade(address) internal override {}

    //A function named getAuctionPrice() to get the current price of the NFT.
    function getAuctionPrice() public view returns(uint256){
        require(block.number <= lastBlockNumber, "The auction has ended");
        uint256 auctionPrice = initialPrice - (lastBlockNumber - block.number) * offerPriceDecrement;
        return auctionPrice;
    }

    //A function to buy the NFT.
    function auctionMint() external {
        require(!ended, "The auction has ended");
        require(block.number <= lastBlockNumber, "The auction has ended");
        uint256 auctionPrice = getAuctionPrice();
        require(coin.balanceOf(msg.sender) >= auctionPrice, "your coin is lower than set value");
        nft.transferFrom(owner, msg.sender, nftId);
        coin.transferFrom(msg.sender, owner, auctionPrice);
        ended = true;
        emit AuctionEnded(msg.sender, auctionPrice);
    }

    function auctionEnded() external{
        if (block.number <= lastBlockNumber)
            revert AuctionNotYetEnded();
        if (ended)
            revert AuctionAlreadyEnded();
        require(msg.sender == owner,"The current account does not have permission to end this auction");
        
        emit AuctionEnded(msg.sender, reservePrice);
    }

}
