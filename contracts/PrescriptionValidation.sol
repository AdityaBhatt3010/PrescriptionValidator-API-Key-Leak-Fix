// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PrescriptionValidation {
    mapping(bytes32 => bool) private prescriptions;

    function storePrescription(bytes32 hash) public {
        prescriptions[hash] = true;
    }

    function verifyPrescription(bytes32 hash) public view returns (bool) {
        return prescriptions[hash];
    }
}
