import { ethers } from "hardhat";

async function main() {
  const reservePrice = 200;
  const numBlocksAuctionOpen = 10;
  const offerPriceDecrement = 20;
  const _nftTokenId = 6418;

  const [owner, otherAccount1] = await ethers.getSigners();

  const NFTFactory = await ethers.getContractFactory("NFT");
  const NFT = await NFTFactory.deploy();

  //NFT mint
  NFT.mint(owner.address, _nftTokenId);
  const NFTDutchAuctionFactory = await ethers.getContractFactory("NFTDutchAuction");
  const NFTDutchAuction = await NFTDutchAuctionFactory.deploy(owner.address, _nftTokenId, reservePrice, numBlocksAuctionOpen, offerPriceDecrement);

  //NFT approve
  NFT.approve(NFTDutchAuction.address, _nftTokenId);

  console.log(`NFT Dutch Auction deployed successfully`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
