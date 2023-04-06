import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError,
} from "@web3-react/injected-connector";
import { ChangeEvent, ReactElement, useState } from "react";
import { Provider } from "../utils/provider";
import styled from "styled-components";
import { ethers } from "ethers";
import Background from '../images/bid.png';
import BasicDutchAuctionArtifact from "../artifacts/contracts/BasicDutchAuction.sol/BasicDutchAuction.json";

const StyledButton = styled.button`
  position: relative; 
  background: #ecd300; 
  background: radial-gradient(hsl(54, 100%, 50%), 
  hsl(54, 100%, 40%)); 
  font-size: 1.4rem; 
  text-shadow: 0 -1px 0 #c3af07; 
  color: white; 
  border: 1px solid hsl(54, 100%, 20%); 
  border-radius: 100%; 
  height: 50px; 
  width: 50px; 
  z-index: 4; 
  outline: none; 
  box-shadow: inset 0 1px 0 hsl(54, 100%, 50%), 0 2px 0 hsl(54, 100%, 20%), 0 3px 0 hsl(54, 100%, 18%), 0 4px 0 hsl(54, 100%, 16%), 0 5px 0 hsl(54, 100%, 14%), 0 6px 0 hsl(54, 100%, 12%), 0 7px 0 hsl(54, 100%, 10%), 0 8px 0 hsl(54, 100%, 8%), 0 9px 0 hsl(54, 100%, 6%);
`;

const style = {
  bgd: {
    backgroundSize: 'contain',
    backgroundColor: "white",
    backgroundImage: `url(${Background})`,
    backgroundRepeat: "no-repeat",
    // backgroundAttachment: "fixed",
  }
}

const getErrorMessage = (error: Error): string => {
  switch (error.constructor) {
    case NoEthereumProviderError:
      return "No Ethereum browser extension detected. Please install MetaMask extension.";
    case UnsupportedChainIdError:
      return "You're connected to an unsupported network.";
    case UserRejectedRequestError:
      return "Please authorize this website to access your Ethereum account.";
    default:
      return error.message;
  }
};

const Bid = (): ReactElement => {
  const { error, library } = useWeb3React<Provider>();
  const [contractAddress, setContractAddress] = useState<string>("");
  const [winner, setWinner] = useState<string>("");
  const [bidAmount, setBidAmount] = useState<number>(0);

  const handleBid = async () => {
    if (!library || !contractAddress || !bidAmount) {
      window.alert(
        "Please connect to a wallet, then enter a contract address and bid amount"
      );
      return;
    }

    const basicDutchAuction = new ethers.Contract(
      contractAddress,
      BasicDutchAuctionArtifact.abi,
      library.getSigner()
    );
    const [currentPrice] = await Promise.all([
      basicDutchAuction.getPrice(),
    ]);
    if (bidAmount < currentPrice) {
      window.alert(
        "Bid failed! Your bid must be greater than the current price!"
      );
      return;
    }
    try {
      const bid = await basicDutchAuction.bid(ethers.BigNumber.from(bidAmount));
      await bid.wait();
      if (bid) {
        window.alert("Bid successful");
        const winner1 = await basicDutchAuction.winner();
        setWinner(winner1);
      }
    } catch (e: any) {
      window.alert("Bid failed");
    }
  };

  if (error) {
    window.alert(getErrorMessage(error));
  }

  const handleContractAddressChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setContractAddress(event.target.value);
  };

  const handleBidAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setBidAmount(Number(event.target.value));
  };

  return (
    <>
      <div style={style.bgd}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <h4>Auction Bid</h4>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <label>Deployed contract address: </label>
          <input
            onChange={handleContractAddressChange}
            type="text"
            value={contractAddress}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <label> Bid Amount </label>
          <input
            type="number"
            min="0"
            onChange={handleBidAmountChange}
            value={bidAmount}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <span>
            {" "}
            <StyledButton onClick={handleBid}>Bid</StyledButton>{" "}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
            marginTop: "30px",
          }}
        >
          <label>Winner: </label>
          <input type="text" value={winner} readOnly />
        </div>
      </div>
    </>
  );
};

export default Bid;
