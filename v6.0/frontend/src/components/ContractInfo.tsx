import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError,
} from "@web3-react/injected-connector";
import { ethers } from "ethers";
import { ChangeEvent, ReactElement, useState } from "react";
import styled from "styled-components";
import { Provider } from "../utils/provider";
import Background from '../images/info.png';
import BasicDutchAuctionArtifact from "../artifacts/contracts/BasicDutchAuction.sol/BasicDutchAuction.json";

function getErrorMessage(error: Error): string {
  let errorMessage: string;

  switch (error.constructor) {
    case NoEthereumProviderError:
      errorMessage =
        "No Ethereum browser extension detected. Please install MetaMask extension.";
      break;
    case UnsupportedChainIdError:
      errorMessage = "You're connected to an unsupported network.";
      break;
    case UserRejectedRequestError:
      errorMessage =
        "Please authorize this website to access your Ethereum account.";
      break;
    default:
      errorMessage = error.message;
  }

  return errorMessage;
}

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

const style = {
  bgd: {
    // backgroundAttachment: "fixed",
    backgroundSize: 'contain',
    backgroundColor: "white",
    backgroundImage: `url(${Background})`,
    backgroundRepeat: "no-repeat",
    overflow: "hidden",
  }
}

export function ContractInfo(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, error } = context;
  const [reservePriceLookUp, setReservePriceLookUp] = useState<number>();
  const [priceDecrementLookUp, setPriceDecrementLookUp] = useState<number>();
  const [contractAddress, setContractAddress] = useState<string>("");
  const [currentPriceLookUp, setCurrentPrice] = useState<number>();
  const [winner, setWinner] = useState<string>("");

  const handleContractAddressChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setContractAddress(event.target.value);
  };

  const handleGetInfo = async () => {
    const basicDutchAuction = new ethers.Contract(
      contractAddress,
      BasicDutchAuctionArtifact.abi,
      library
    );
    const reservePriceLookUp = await basicDutchAuction.reservePrice();
    const priceDecrementLookUp = await basicDutchAuction.offerPriceDecrement();
    const currentPrice = await basicDutchAuction.getPrice();
    const winner = await basicDutchAuction.winner();
    setReservePriceLookUp(reservePriceLookUp.toNumber());
    setPriceDecrementLookUp(priceDecrementLookUp.toNumber());
    setCurrentPrice(currentPrice.toNumber());
    setWinner(winner);
  };

  if (!!error) {
    window.alert(getErrorMessage(error));
  }

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
          <h4>Auction Info</h4>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <label>Contract Address: </label>
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
          <span>
            <StyledButton onClick={handleGetInfo}> Info </StyledButton>
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <label> Winner: </label>
          <input type="text" value={winner} readOnly />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <label> Current Price: </label>
          <input type="text" value={currentPriceLookUp} readOnly />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <label> Reserve Price: </label>
          <input type="text" value={reservePriceLookUp} readOnly />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <label> Price Decrement: </label>
          <input type="text" value={priceDecrementLookUp} readOnly />
        </div>
      </div>
    </>
  );
}
