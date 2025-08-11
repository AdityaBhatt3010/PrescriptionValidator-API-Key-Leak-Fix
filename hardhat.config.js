require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const { ALCHEMY_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: ALCHEMY_URL || "",
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : []
    }
  }
};
