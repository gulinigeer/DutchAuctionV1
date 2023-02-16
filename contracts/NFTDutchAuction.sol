// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

//Extend the IERC721 contract interface to use the ERC721 methods in this contract, we will need them for use with our NFT.
interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 nftId
    ) external;
}

contract NFTDutchAuction {
    IERC721 public immutable nft;
    uint256 public immutable nftId;

    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    address payable public immutable owner;
    uint256 public lastBlockNumber;
    uint256 public initialPrice;
    bool public ended;

    event AuctionEnded(address winner, uint256 amount);

    // The auction has already ended.
    error AuctionAlreadyEnded();
    // The auction has not ended yet.
    error AuctionNotYetEnded();

    //The above state variables are initialized in the constructor.
    constructor(
        address erc721TokenAddress,
        uint256 _nftTokenId,
        uint256 _reservePrice, 
        uint256 _numBlocksAuctionOpen, 
        uint256 _offerPriceDecrement
        ) payable{
            reservePrice = _reservePrice;
            numBlocksAuctionOpen = _numBlocksAuctionOpen;
            offerPriceDecrement = _offerPriceDecrement;
            //Set the owner as the deployer of the contract.
            owner = payable(msg.sender);
            lastBlockNumber = block.number + numBlocksAuctionOpen;
            initialPrice = reservePrice + numBlocksAuctionOpen * offerPriceDecrement;
            ended = false;

            nft = IERC721(erc721TokenAddress);
            nftId = _nftTokenId;
    }

    //A function named getAuctionPrice() to get the current price of the NFT.
    function getAuctionPrice() public view returns(uint256){
        require(block.number <= lastBlockNumber, "The auction has ended");
        uint256 auctionPrice = initialPrice - (lastBlockNumber - block.number) * offerPriceDecrement;
        return auctionPrice;
    }

    //A function to buy the NFT.
    function auctionMint() external payable{
        require(!ended, "The auction has ended");
        require(block.number <= lastBlockNumber, "The auction has ended");
        uint256 auctionPrice = getAuctionPrice();
        require(msg.value >= auctionPrice, "your bid is lower than set value");
        //Use the transferFrom function of IERC721 to transfer nft. NFT will be identified with the help of nftId and will be transferred from the seller to the current msg.sender (i.e. the person currently interacting with the contract).
        nft.transferFrom(owner, msg.sender, nftId);
        
        //The variable refund is used to store any excess ETH amount left over from the buyer's purchase of NFT and is calculated by subtracting the amount of ETH sent by the buyer ( msg.value ) from the current price of NFT, i.e. price.
        uint refund = msg.value - auctionPrice;
        //Check if the value of the refund variable is zero, if so the contract will send the value back to the buyer.
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
            ended = true;
        }
        emit AuctionEnded(msg.sender, auctionPrice);
    }

    //nobody can bid sucessfully, owner use the function to end this auction.
    function auctionEnded() external{
        if (block.number <= lastBlockNumber)
            revert AuctionNotYetEnded();
        if (ended)
            revert AuctionAlreadyEnded();
        require(msg.sender == owner,"only the owner of this contract can end the auction");
        
        //Use the selfdestruct function to delete the contract and transfer the ETH to the seller.
        selfdestruct(owner);
    }

}
