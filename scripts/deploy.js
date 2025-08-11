const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  // Check Sepolia balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance (ETH):", ethers.utils.formatEther(balance));

  if (balance.eq(0)) {
    console.error("❌ Your Sepolia account has 0 ETH. Please fund it before deploying.");
    process.exit(1);
  }

  const PrescriptionValidation = await ethers.getContractFactory("PrescriptionValidation");
  const prescriptionValidation = await PrescriptionValidation.deploy();

  await prescriptionValidation.deployed();

  console.log("✅ PrescriptionValidation deployed to:", prescriptionValidation.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
