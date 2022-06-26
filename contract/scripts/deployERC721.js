const main = async () => {
  const nftContractFactory = await hre.ethers.getContractFactory("MintERC721");
  const nftContract = await nftContractFactory.deploy();
  await nftContract.deployed();
  console.log("Contract deployed to:", nftContract.address);

  // Call the function.
  const tokenURI = {
    name: "testNFT",
    image: "this is Testing NFT",
    description:
      "https://gateway.pinata.cloud/ipfs/QmSuqTGmJPhJaU5bDAqtUiEbqFAyxLgN63yP4idQ7EdxVg",
  };
  let txn = await nftContract.mintNFT("0xA94188eC744336F8e087D7843bc8424B6160CD75", tokenURI);
  // Wait for it to be mined.
  await txn.wait();
  console.log("Minted NFT #1");

  // txn = await nftContract.makeAnEpicNFT()
  // // Wait for it to be mined.
  // await txn.wait()
  // console.log("Minted NFT #2")
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
