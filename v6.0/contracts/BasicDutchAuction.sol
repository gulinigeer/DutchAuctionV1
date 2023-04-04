// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract BasicDutchAuction {
  address payable public immutable seller;
  address payable public winner;
  uint256 public amount;
  uint256 public immutable numBlocksAuctionOpen;
  uint256 public immutable reservePrice;
  uint256 public immutable initialPrice;
  uint256 public immutable offerPriceDecrement;

  uint256 public auctionEndBlock;
  uint256 public initialBlock;

  bool public ended;

  event AuctionEnded(address winner, uint256 amount);

  //The above state variables are initialized in the constructor.
  constructor(
    uint256 _reservePrice,
    uint256 _offerPriceDecrement,
    uint256 _numBlocksAuctionOpen
  ) {
    //Set the seller as the deployer of the contract.
    seller = payable(msg.sender);
    reservePrice = _reservePrice;
    offerPriceDecrement = _offerPriceDecrement;
    numBlocksAuctionOpen = _numBlocksAuctionOpen;
    initialPrice = _reservePrice + _offerPriceDecrement * _numBlocksAuctionOpen;

    initialBlock = block.number;
    auctionEndBlock = block.number + _numBlocksAuctionOpen;

    ended = false;
  }

  //A function/method named getPrice() to get the current price.
  function getPrice() public view returns (uint256) {
    require(block.number <= auctionEndBlock, "Auction Ended");
    return initialPrice - (block.number - initialBlock) * offerPriceDecrement;
  }

  //A function to buy.
  function bid() external payable returns (address) {
    //A check to ensure that the current block quantity ensures that the asking price is not lower than the minimum price, and an error message is displayed if the check fails.
    require(!ended, "This auction has ended");
    require(block.number <= auctionEndBlock, "This auction has ended");

    //Variable price, used to store the current price of the NFT, which will be obtained from the getPrice() method.
    uint256 price = getPrice();

    //Check to ensure that the amount of ETH sent by the bidder/buyer ( msg.value ) is always greater than or equal to the current price, if the check fails an error message will be displayed.
    require(msg.value >= price, "The bid is less than the price");

    winner = payable(msg.sender);
    amount = msg.value;
    ended = true;
    payable(msg.sender).transfer(amount);
    emit AuctionEnded(winner, amount);
    return winner;
  }
}
