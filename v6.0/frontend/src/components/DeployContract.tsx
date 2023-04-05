import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError,
} from "@web3-react/injected-connector";
import { Contract, ethers, Signer } from "ethers";
import { ReactElement, useEffect, useState, MouseEvent } from "react";
import { Provider } from "../utils/provider";
import BasicDutchAuctionArtifact from "../artifacts/contracts/BasicDutchAuction.sol/BasicDutchAuction.json";
import styled from "styled-components";
import Background from '../images/deploy.png';
import { getParseTreeNode } from "typescript";
const style = {
  bgd: {
    // display: "grid",
    // gridTemplateColumns: "1fr 1fr 1fr 1fr",
    // gridGap: "1rem",
    // color: 'rgba(0,0,0,.25)',
    backgroundImage: `url(${Background})`,
    backgroundSize: 'contain',
    backgroundRepeat: "no-repeat",
    // backgroundColor: "yellow",
    // fontweight: "bolder",
  }
}


function getErrorMessage(error: Error): string {
  switch (error.constructor) {
    case NoEthereumProviderError:
      return `No Ethereum browser extension detected. Please install MetaMask extension.`;
    case UnsupportedChainIdError:
      return `You're connected to an unsupported network.`;
    case UserRejectedRequestError:
      return `Please authorize this website to access your Ethereum account.`;
    default:
      return error.message;
  }
}

const StyledButton = styled.button`
  width: 180px;
  height: 2rem;
  border-radius: 1rem;
  border-color: ${({ disabled }) => (disabled ? "unset" : "blue")};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  place-self: center;
  background-color: white;
`;

export function DeployContract(): ReactElement {
  const context = useWeb3React<Provider>();
  const [reservePrice, setReservePrice] = useState<number>();
  const [auctionBlocks, setAuctionBlocks] = useState<number>();
  const [priceDecrement, setPriceDecrement] = useState<number>();
  const [basicDutchAuction, setBasicDutchAuction] = useState<Contract>();
  const [contractAddress, setContractAddress] = useState<string>("");
  const [signer, setSigner] = useState<Signer>();
  const { library, active, error } = context;

  if (!!error) {
    window.alert(getErrorMessage(error));
  }

  useEffect(() => {
    setSigner(library?.getSigner());
  }, [library]);

  useEffect(() => {
    if (!basicDutchAuction) {
      return;
    }

    async function getBDA(basicDutchAuction: Contract): Promise<void> { }

    getBDA(basicDutchAuction);
  }, [basicDutchAuction]);

  const handleDeployContract = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (basicDutchAuction || !signer) {
      return;
    }

    if (!reservePrice || !auctionBlocks || !priceDecrement) {
      window.alert("Please enter all the values");
      return;
    }

    try {
      const BasicDutchAuction = await new ethers.ContractFactory(
        BasicDutchAuctionArtifact.abi,
        BasicDutchAuctionArtifact.bytecode,
        signer
      );
      const BasicDutchAuctionContract = await BasicDutchAuction.deploy(
        reservePrice,
        priceDecrement,
        auctionBlocks
      );

      await BasicDutchAuctionContract.deployed();

      setBasicDutchAuction(BasicDutchAuctionContract);

      window.alert(
        `Basic Dutch Auction deployed to: ${BasicDutchAuctionContract.address}`
      );

      setContractAddress(BasicDutchAuctionContract.address);
    } catch (error: any) {
      window.alert(
        "Error!" + (error && error.message ? `\n\n${error.message}` : "")
      );
    }
  };

  const handleInputChange = (event: any, setState: Function) => {
    setState(event.target.value);
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
          <h4>Deploy Auction</h4>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <label>Reserve Price: </label>
          <input
            type="text"
            pattern="[0-9]"
            onChange={(event) => handleInputChange(event, setReservePrice)}
            value={reservePrice}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <label>Auction Blocks: </label>
          <input
            type="text"
            pattern="[0-9]"
            onChange={(event) => handleInputChange(event, setAuctionBlocks)}
            value={auctionBlocks}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <label>Price Decrement: </label>
          <input
            type="text"
            pattern="[0-9]*"
            onChange={(event) => handleInputChange(event, setPriceDecrement)}
            value={priceDecrement}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
            // alignItems: "center",
          }}>
          <StyledButton
            disabled={!active || !!basicDutchAuction}
            onClick={handleDeployContract}
          >
            Deploy
          </StyledButton>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            // alignItems: "center",
          }}
        >
          <label>Contract Address: </label>
          <input type="text" value={contractAddress} readOnly />
        </div>
      </div>
    </>
  );
}
