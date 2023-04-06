# DutchAuctionV1
Remix Test
1.Contract deployment: First, deploy the DutchAuction.sol contract and set the auction start time via the setAuctionStartTime() function. The starting time used in this example is, July 12, 2022 at 1:30, corresponding to utc time 1658338200.
 ![fda67b66480acc7c095d2f6012991835](https://user-images.githubusercontent.com/113514383/216499767-432d6854-8cbb-493a-87eb-0472177ac266.png)

2.Dutch auction: Subsequently, the current auction price can be obtained through the getAuctionPrice() function. It can be observed that the price before the start of the auction is the starting price AUCTION_START_PRICE As the auction proceeds, the auction price is gradually reduced until it is reduced to the floor price AUCTION_END_PRICE after no further change. 
![744e163d5299c67f547c2c529fd67494](https://user-images.githubusercontent.com/113514383/216499802-e485a8df-f534-4c3a-88b9-6bde9f6218da.png)

3.Mint operation: through the auctionMin() function, complete the mint, you can see that in this case, because the time has exceeded the auction time, so only the floor price is consumed to complete the auction. 
![3a3c1b72a841a5adce59357c54561b9d](https://user-images.githubusercontent.com/113514383/216499880-49e93497-6bc3-46c3-89bf-5edb08cd6232.png)

4.Extract ETH: directly through the withdrawMoney() function, you can send the raised ETH to the contract creator's address through call().

