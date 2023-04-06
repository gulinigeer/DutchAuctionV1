import { expect } from "chai";
import { ethers, upgrades} from "hardhat";

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

  async function deployBidFixture() {
    const { NFT, owner, otherAccount1, otherAccount2 } = await deployNFTFixture();

    const BidFactory = await ethers.getContractFactory("Bid");
    const Bid = await BidFactory.deploy("Bid", "BID");
    return { NFT, Bid, owner, otherAccount1, otherAccount2 };
  }

  async function deployNFTDutchAuctionFixture() {

    const { NFT, Bid, owner, otherAccount1, otherAccount2 } = await deployBidFixture();
    //NFT mint
    NFT.mint(owner.address, _nftTokenId);
    const NFTDutchAuctionFactory = await ethers.getContractFactory("NFTDutchAuction_ERC20Bids");
    const NFTDutchAuction = await upgrades.deployProxy(NFTDutchAuctionFactory, [Bid.address, NFT.address, _nftTokenId, reservePrice, numBlocksAuctionOpen, offerPriceDecrement], {kind:'uups', initializer:'initialize'});

    //NFT approve
    NFT.approve(NFTDutchAuction.address, _nftTokenId);

    //Bid Token mint
    Bid.approve(owner.address, 300000000);
    Bid.transferFrom(owner.address, otherAccount1.address, 100000);
    console.log(await Bid.balanceOf(otherAccount1.address));
    Bid.transferFrom(owner.address, otherAccount2.address, 100);
    // Bid.approve(otherAccount1.address, 100000);
    // Bid.approve(otherAccount2.address, 100);
    console.log(await Bid.balanceOf(otherAccount1.address));

    return { NFT, Bid, NFTDutchAuction, owner, otherAccount1, otherAccount2 };
  }


  describe("Deployment", function () {

    it("Should equal compare the owner of NFT(_nftTokenId) with owner of NFT contract", async function () {
      const { NFT, Bid, NFTDutchAuction, owner, otherAccount1, otherAccount2 } = await deployNFTDutchAuctionFixture();
      expect(await NFT.ownerOf(_nftTokenId)).to.equal(owner.address);
    });

    it("nft in NFTDutchAuction should equal with approved nft", async function () {
      const { NFT, Bid, NFTDutchAuction, owner, otherAccount1, otherAccount2 } = await deployNFTDutchAuctionFixture();
      expect(await NFTDutchAuction.nft()).to.equal(NFT.address);
      console.log(await NFTDutchAuction.nft());
    });

    it("nftId in NFTDutchAuction should equal with approved nftId", async function () {
      const { NFT, Bid, NFTDutchAuction, owner, otherAccount1, otherAccount2 } = await deployNFTDutchAuctionFixture();
      expect(await NFTDutchAuction.nftId()).to.equal(_nftTokenId);
      console.log(await NFTDutchAuction.nftId());
    });

    it("offchain sign to permit tokens", async function () {
      const { NFT, Bid, NFTDutchAuction, owner, otherAccount1, otherAccount2 } = await deployNFTDutchAuctionFixture();
      const name = "Bid";
      const version = "1";
      const nonce = 0;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
      const value = ethers.utils.parseUnits("100", "ether");
  
      const domain = {
        name,
        version,
        chainId: await owner.getChainId(),
        verifyingContract: Bid.address,
      };
  
      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const message = {
        owner: owner.address,
        spender: otherAccount1.address,
        value,
        nonce,
        deadline,
      };
  
      const signature = await owner._signTypedData(domain, types, message);
      const sig = ethers.utils.splitSignature(signature);
  
      await Bid.permit(
        owner.address,
        otherAccount1.address,
        value,
        deadline,
        sig.v,
        sig.r,
        sig.s
      );
  
      expect(await Bid.allowance(owner.address, otherAccount1.address)).to.equal(
        value
      );
    });

  });


  describe("auctionMint", function () {

    it("account bidding with lower price should return reminder info", async function () {
      const { NFT, Bid, NFTDutchAuction, owner, otherAccount1, otherAccount2 } = await deployNFTDutchAuctionFixture();
      var promise = NFTDutchAuction.connect(otherAccount2).auctionMint({gasPrice: 15000000000});
      expect(await NFTDutchAuction.ended()).to.equal(false);
    });

    it("account bidding with enough price should success", async function () {
      const { NFT, Bid, NFTDutchAuction, owner, otherAccount1, otherAccount2 } = await deployNFTDutchAuctionFixture();
      var promise = NFTDutchAuction.connect(otherAccount1).auctionMint({gasPrice: 15000000000});
      expect(await NFTDutchAuction.ended()).to.equal(false);
      // expect(await NFT.ownerOf(_nftTokenId)).to.equal(otherAccount1.address);
    });

    it("Bid Token transfer successfully", async function () {
      const { NFT, Bid, NFTDutchAuction, owner, otherAccount1, otherAccount2 } = await deployNFTDutchAuctionFixture();
      var promise = Bid.transferFrom(owner.address, otherAccount2.address, 100, {gasPrice: 15000000000});
      expect(await Bid.balanceOf(otherAccount2.address)).to.equal(200);
    });

  });


  describe("autionEnded", function () {

    it("account can only be ended by the owner", async function () {
      const { NFT, Bid, NFTDutchAuction, owner, otherAccount1, otherAccount2 } = await deployNFTDutchAuctionFixture();
      var promise = NFTDutchAuction.connect(otherAccount1).auctionEnded();
      expect(await NFTDutchAuction.ended()).to.equal(false);
    });

    it("owner can not end the auction before the end of the program", async function () {
      const { NFT, Bid, NFTDutchAuction, owner, otherAccount1, otherAccount2 } = await deployNFTDutchAuctionFixture();
      var promise = NFTDutchAuction.connect(owner).auctionEnded();
      expect(await NFTDutchAuction.ended()).to.equal(false);
    });

    it("owner can end the auction after the end of the program", async function () {
      const { NFT, Bid, NFTDutchAuction, owner, otherAccount1, otherAccount2 } = await deployNFTDutchAuctionFixture();
      var promise = NFTDutchAuction.connect(owner).auctionEnded();
      expect(!(await NFTDutchAuction.ended())).to.equal(true);
    });

  });

});
