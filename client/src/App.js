import "./styles/App.css";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { pinJSONToIPFS } from "./utils/pinata";
// require("dotenv").config();
import { ReactComponent as Loading } from "./assets/loading.svg";
import twitterLogo from "./assets/twitter-logo.svg";
// import myEpicNft from "./utils/MyEpicNFT.json";
import contractABI from "./utils/contract-abi.json";
// Constants
const TWITTER_HANDLE = "parmeshwar4321";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "https://testnets.opensea.io/collection/mynft-rbmzdfnvuy";
/* const TOTAL_MINT_COUNT = 50; */
// const CONTRACT_ADDRESS = "0xfDe5CaD58ebF39441e99eda11a4FF089B4A4F613";
const CONTRACT_ADDRESS = "0x22431D080C3A3b097db391e71525203656282C71";
const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setURL] = useState("");
  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    checkIfWalletIsConnected();
  });
  const handleAccountsChanged = (a) => {
    if (!a.length) {
      setIsConnected(false);
      setStatus("wallet disconnected!");
    } else {
      setCurrentAccount(a[0]);
      setStatus("👆🏽 Yooo! lets mint your first NFT.");
      console.log("accounts changed");
    }
  };

  const checkIfWalletIsConnected = async () => {
    /*
     * First make sure we have access to window.ethereum
     */
    const { ethereum } = window;

    if (!ethereum) {
      setStatus("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    /*
     * Check if we're authorized to access the user's wallet
     */
    const accounts = await ethereum.request({ method: "eth_accounts" });
    const chainId = await ethereum.request({ method: "eth_chainId" });

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }

    if (accounts.length > 0) {
      const [account] = accounts;
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setIsConnected(true);

      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener();
    } else {
      setStatus("Not Connected!");
    }
  };
  /*
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        setStatus("Get MetaMask!");
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setIsConnected(true);
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI.abi,
          signer
        );

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setStatus(
            `✅Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      if (
        url.trim() === "" ||
        name.trim() === "" ||
        description.trim() === ""
      ) {
        return setStatus(
          "❗Please make sure all fields are completed before minting."
        );
      }
      //make metadata
      const metadata = new Object();
      metadata.name = name;
      metadata.image = url;
      metadata.description = description;
      setLoading(true);
      const pinataResponse = await pinJSONToIPFS(metadata);
      setLoading(true);
      if (!pinataResponse.success) {
        return setStatus(
          "😢 Something went wrong while uploading your tokenURI."
        );
      }
      const tokenURI = pinataResponse.pinataUrl;
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI.abi,
          signer
        );
        console.log(connectedContract);
        setStatus("Going to pop wallet now to pay gas...");
        // let nftTxn = await connectedContract.makeAnEpicNFT();
        let nftTxn = await connectedContract.mintNFT(currentAccount, tokenURI);
        console.log(nftTxn);
        setStatus("Mining...please wait.");
        await nftTxn.wait();

        setStatus(
          <span>
            <p>
              {" "}
              🦊{" "}
              <a
                rel="noopener"
                href={` https://rinkeby.etherscan.io/tx/${nftTxn.hash}`}
              >
                ✅Mined, see transaction.
              </a>
            </p>
          </span>
        );
        setName("");
        setDescription("");
        setURL("");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = isConnected ? (
    <div className="nftform">
      <form>
        <h2>🖼 Link to asset: </h2>
        <input
          type="text"
          placeholder="e.g. https://gateway.pinata.cloud/ipfs/<hash>"
          onChange={(event) => setURL(event.target.value)}
        />
        <h2>🤔 Name: </h2>
        <input
          type="text"
          placeholder="e.g. My first NFT!"
          onChange={(event) => setName(event.target.value)}
        />
        <h2>✍️ Description: </h2>
        <input
          type="text"
          placeholder="e.g. Even cooler than cryptokitties ;)"
          onChange={(event) => setDescription(event.target.value)}
        />
      </form>
      <button
        onClick={askContractToMintNft}
        className="cta-button mint-button"
        disabled={loading}
      >
        {loading && (
          <div className="loading-icon">
            <Loading />
          </div>
        )}
        Mint{loading && "ing"} NFT
      </button>
      <p id="status" style={{ color: "red" }}>
        {status}
      </p>
      <div className="footer-container">
        <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
        <a
          className="footer-text"
          href={TWITTER_LINK}
          target="_blank"
          rel="noreferrer"
        >
          built by @{TWITTER_HANDLE}
        </a>
      </div>
    </div>
  ) : (
    <div className="nftform">
      <form>
        <h2>🖼 Link to asset: </h2>
        <input
          disabled
          type="text"
          placeholder="e.g. https://gateway.pinata.cloud/ipfs/<hash>"
          onChange={(event) => setURL(event.target.value)}
        />
        <h2>🤔 Name: </h2>
        <input
          disabled
          type="text"
          placeholder="e.g. My first NFT!"
          onChange={(event) => setName(event.target.value)}
        />
        <h2>✍️ Description: </h2>
        <input
          disabled
          type="text"
          placeholder="e.g. Even cooler than cryptokitties ;)"
          onChange={(event) => setDescription(event.target.value)}
        />
      </form>
      <button
        onClick={askContractToMintNft}
        className="cta-button mint-button"
        disabled
      >
        <div className="loading-icon">
          <Loading />
        </div>
        {loading && "ing"}
      </button>
      <p id="status" style={{ color: "red" }}>
        {status}
      </p>
      <div className="footer-container">
        <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
        <a
          className="footer-text"
          href={TWITTER_LINK}
          target="_blank"
          rel="noreferrer"
        >
          built by @{TWITTER_HANDLE}
        </a>
      </div>
    </div>
  );

  return (
    <div className="App">
      <div className="header-container">
        <div className="wallet-btn">
          <button
            onClick={connectWallet}
            className="cta-button connect-wallet-button"
          >
            {isConnected ? "Connected" : "Connect to Wallet"}
          </button>
        </div>
        <div class="headtext">
          <p className="header"> NFT Minter</p>
          <p className="sub-text">
            Each unique. Each beautiful. create your NFT today.
          </p>
        </div>
        <div className="footer-container">
          <a
            className="footer-text"
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >
            🌊 View Collection on OpenSea
          </a>
        </div>
      </div>
      <div className="container">{renderNotConnectedContainer}</div>
    </div>
  );
};

export default App;
