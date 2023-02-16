import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
var abi = require('ethereumjs-abi');
var BigNumber = require('bignumber.js');

describe("NFTDutchAuction", function () {
  const reservePrice = 200;
  const numBlocksAuctionOpen = 10;
  const offerPriceDecrement = 20;
  const _nftTokenId = 6418;

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.  
  async function deployNFTFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount1, otherAccount2] = await ethers.getSigners();

    const NFTFactory = await ethers.getContractFactory("NFT");
    const NFT = await NFTFactory.deploy();
    return { NFT, owner, otherAccount1, otherAccount2 };
  }

  async function deployNFTDutchAuctionFixture() {

    const NFT = await deployNFTFixture();
    //NFT mint
    NFT.NFT.mint(NFT.owner.address, _nftTokenId);
    const NFTDutchAuctionFactory = await ethers.getContractFactory("NFTDutchAuction");
    const NFTDutchAuction = await NFTDutchAuctionFactory.deploy(NFT.NFT.address, _nftTokenId, reservePrice, numBlocksAuctionOpen, offerPriceDecrement);

    //NFT approve
    NFT.NFT.approve(NFTDutchAuction.address, _nftTokenId);

    return { NFT, NFTDutchAuction };
  }


  describe("Deployment", function () {

    it("Should equal compare the owner of NFT(_nftTokenId) with owner of NFT contract", async function () {
      const {NFT, NFTDutchAuction} = await deployNFTDutchAuctionFixture();
      expect(await NFT.NFT.ownerOf(_nftTokenId)).to.equal(NFT.owner.address);
    });

    it("nft in NFTDutchAuction should equal with approved nft", async function () {
      const {NFT, NFTDutchAuction} = await deployNFTDutchAuctionFixture();
      expect(await NFTDutchAuction.nft()).to.equal(NFT.NFT.address);
      console.log(await NFTDutchAuction.nft());
    });

    it("nftId in NFTDutchAuction should equal with approved nftId", async function () {
      const {NFT, NFTDutchAuction} = await deployNFTDutchAuctionFixture();
      expect(await NFTDutchAuction.nftId()).to.equal(_nftTokenId);
      console.log(await NFTDutchAuction.nftId());
    });

  });


  describe("auctionMint", function () {

    it("account bidding with lower price should return reminder info", async function () {
      const {NFT, NFTDutchAuction} = await deployNFTDutchAuctionFixture();
      var promise = NFTDutchAuction.connect(NFT.otherAccount1).auctionMint({value: 190, gasPrice: 15000000000});
      expect(await NFTDutchAuction.ended()).to.equal(false);
    });

    it("account bidding with enough price should success", async function () {
      const {NFT, NFTDutchAuction} = await deployNFTDutchAuctionFixture();
      var promise = NFTDutchAuction.connect(NFT.otherAccount1).auctionMint({value: 400, gasPrice: 15000000000});
      expect(await NFTDutchAuction.ended()).to.equal(true);
      expect(await NFT.NFT.ownerOf(_nftTokenId)).to.equal(NFT.otherAccount1.address);
    });

  });


  describe("autionEnded", function () {

    it("account can only be ended by the owner", async function () {
      const {NFT, NFTDutchAuction} = await deployNFTDutchAuctionFixture();
      var promise = NFTDutchAuction.connect(NFT.otherAccount1).auctionEnded();
      expect(await NFTDutchAuction.ended()).to.equal(false);
    });

    it("owner can not end the auction before the end of the program", async function () {
      const {NFT, NFTDutchAuction} = await deployNFTDutchAuctionFixture();
      var promise = NFTDutchAuction.connect(NFT.owner).auctionEnded();
      expect(await NFTDutchAuction.ended()).to.equal(false);
    });

    it("owner can end the auction after the end of the program", async function () {
      const {NFT, NFTDutchAuction} = await deployNFTDutchAuctionFixture();
      var promise = NFTDutchAuction.connect(NFT.owner).auctionEnded();
      expect(!(await NFTDutchAuction.ended())).to.equal(true);
    });

  });

});
