import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('BasicDutchAuction', function (): void {
  it("Check initial price", async function (): Promise<void> {
    const Factory = await ethers.getContractFactory('BasicDutchAuction');
    const BasicDutchAuction = await Factory.deploy(200, 10, 10);
    await BasicDutchAuction.deployed();

    expect(await BasicDutchAuction.initialPrice()).to.equal(300);
  });
});
