const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // your deployed address
const contractABI = [
    "function storePrescription(bytes32 hash) public",
    "function verifyPrescription(bytes32 hash) public view returns (bool)"
];

async function getFileHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function uploadPrescription() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Please select a file");

    const hash = await getFileHash(file);

    if (typeof window.ethereum !== "undefined") {
        await ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const tx = await contract.storePrescription(hash);
        await tx.wait();
        alert("Prescription stored on blockchain!");
    } else {
        alert("MetaMask not detected");
    }
}

async function checkPrescription() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Please select a file");

    const hash = await getFileHash(file);

    if (typeof window.ethereum !== "undefined") {
        await ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        const valid = await contract.verifyPrescription(hash);
        document.getElementById("verifyResult").innerText = valid
            ? "✅ Valid Prescription"
            : "❌ Invalid Prescription";
    } else {
        alert("MetaMask not detected");
    }
}
