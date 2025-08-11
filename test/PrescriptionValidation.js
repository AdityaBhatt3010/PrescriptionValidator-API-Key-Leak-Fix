const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrescriptionValidation", function () {
  let PrescriptionValidation;
  let prescriptionValidation;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    PrescriptionValidation = await ethers.getContractFactory("PrescriptionValidation");
    prescriptionValidation = await PrescriptionValidation.deploy();
    await prescriptionValidation.deployed();
  });

  describe("Prescription Storage", function () {
    it("Should store a prescription", async function () {
      const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test prescription"));
      await prescriptionValidation.storePrescription(hash);
      expect(await prescriptionValidation.verifyPrescription(hash)).to.equal(true);
    });

    it("Should prevent duplicate prescriptions", async function () {
      const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test prescription"));
      await prescriptionValidation.storePrescription(hash);
      await expect(prescriptionValidation.storePrescription(hash))
        .to.be.revertedWith("Prescription already exists");
    });

    it("Should return false for non-existent prescription", async function () {
      const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("non-existent"));
      expect(await prescriptionValidation.verifyPrescription(hash)).to.equal(false);
    });
  });
});
