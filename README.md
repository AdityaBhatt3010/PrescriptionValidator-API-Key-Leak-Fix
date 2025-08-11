# MedChain - Blockchain Prescription Validation System


## 🏗️ System Architecture

MedChain consists of three main components:

- **Smart Contract**: Deployed on Ethereum Sepolia testnet for prescription storage and verification
- **Frontend Interface**: Modern web application with MetaMask integration
- **Development Environment**: Hardhat-based blockchain development setup

## 🔧 Technical Stack

### Blockchain & Smart Contracts
- Solidity
- Ethers.js
- CSS3
- JavaScript
- Web3

## 📁 Project Structure

```
MedChain/
├── 📄 contracts/
│   └── PrescriptionValidation.sol    # Smart contract for prescription storage
├── 📄 scripts/
│   └── deploy.js                     # Deployment script for Sepolia testnet
├── 📄 test/
│   └── PrescriptionValidation.test.js # Contract unit tests
├── 🌐 frontend/
│   ├── index.html                    # Main application interface
│   ├── style.css                     # Responsive styling and animations
│   └── app.js                        # Web3 integration and UI logic
├── ⚙️ hardhat.config.js              # Hardhat configuration
├── 📦 package.json                   # Node.js dependencies and scripts
├── 🔐 .env                           # Environment variables (not in repo)
└── 📖 README.md                      # Project documentation
```

## 🚀 Installation & Setup

### Prerequisites

![Node.js](https://img.shields.io/badge/Node.js-v14.0.0+-green?style=flat&logo=nodeio/badge/npm-v6.0.0+-red?style.shields.io/badge/MetaMask-Browser%20Extension-orange?style=flat**:
```bash
git clone 
cd MedChain
```

2. **Install dependencies**:
```bash
npm install
```

3. **Environment Configuration**:
Create a `.env` file in the project root:
```env
ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
PRIVATE_KEY=your-wallet-private-key-without-0x-prefix
```

4. **Compile smart contracts**:
```bash
npx hardhat compile
```

5. **Run tests**:
```bash
npm test
```

6. **Deploy to Sepolia testnet**:
```bash
npm run deploy:sepolia
```

7. **Start development server**:
```bash
npx http-server -p 8000
```

8. **Access the application**:
Open `http://127.0.0.1:8000` in your browser

## 🔗 Smart Contract Details

### Network Information
- **Contract Address**: `0x4620d3c455F41e9500a2dF5bE69FDd819DF4B64C`
- **Network**: Ethereum Sepolia Testnet
- **Chain ID**: `11155111`
- **Block Explorer**: [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x4620d3c455F41e9500a2dF5bE69FDd819DF4B64C)

### Contract Functions

#### `storePrescription(bytes32 hash)`
- **Purpose**: Store a prescription hash on the blockchain
- **Access**: Public function
- **Parameters**: `hash` - SHA-256 hash of the prescription file
- **Gas Cost**: ~50,000 gas units
- **Events**: Emits `PrescriptionStored` event

```solidity
function storePrescription(bytes32 hash) public {
    prescriptions[hash] = true;
    emit PrescriptionStored(hash, msg.sender, block.timestamp);
}
```

#### `verifyPrescription(bytes32 hash)`
- **Purpose**: Verify if a prescription exists on the blockchain
- **Access**: Public view function (read-only)
- **Parameters**: `hash` - SHA-256 hash of the prescription file
- **Returns**: `bool` - true if prescription exists, false otherwise
- **Gas Cost**: Minimal (read operation)

```solidity
function verifyPrescription(bytes32 hash) public view returns (bool) {
    return prescriptions[hash];
}
```

### Security Features
- ✅ **Hash-based Storage**: Only file hashes stored for privacy
- ✅ **Immutable Records**: Once stored, prescriptions cannot be modified
- ✅ **Event Logging**: All transactions logged with timestamps
- ✅ **Access Control**: Public verification, authenticated storage

## 🌐 Frontend Architecture

### Key Components

#### 📤 **Upload Interface**
- Drag & drop file upload
- File type validation (PDF, JPEG, PNG)
- File size limit (10MB maximum)
- Real-time file information display
- Progress indicators during upload

#### 🔍 **Verification System**
- File hash comparison with blockchain records
- Real-time verification status
- Detailed verification results
- Transaction history links

#### 🔗 **Web3 Integration**
- MetaMask wallet connection
- Network validation (Sepolia required)
- Transaction status monitoring
- Gas fee estimation
- Error handling and user feedback

### Supported File Types
| Type | MIME Type | Max Size |
|------|-----------|----------|
| PDF | `application/pdf` | 10MB |
| JPEG | `image/jpeg`, `image/jpg` | 10MB |
| PNG | `image/png` | 10MB |

### Browser Compatibility
| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 88+ | ✅ Full |
| Firefox | 85+ | ✅ Full |
| Safari | 14+ | ⚠️ Limited |
| Edge | 88+ | ✅ Full |

## 🔐 Security Implementation

### Cryptographic Security
- **SHA-256 Hashing**: Secure file fingerprinting using Web Crypto API
- **Blockchain Immutability**: Tamper-proof storage on Ethereum
- **Private Key Management**: MetaMask secure key handling

### Data Privacy
- **No File Storage**: Only cryptographic hashes stored on-chain
- **Zero Knowledge**: File contents remain completely private
- **Pseudonymous**: Ethereum addresses provide user privacy

### Smart Contract Security
- **Reentrancy Protection**: SafeMath and secure patterns
- **Access Control**: Role-based permissions
- **Event Logging**: Complete audit trail
- **Gas Optimization**: Efficient storage patterns

## 📊 Network Configuration

### Sepolia Testnet Setup
```javascript
{
  networkName: "Sepolia",
  rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/API-KEY",
  chainId: 11155111,
  currencySymbol: "ETH",
  blockExplorer: "https://sepolia.etherscan.io"
}
```

### Getting Test ETH
- **Alchemy Faucet**: https://www.alchemy.com/faucets/ethereum-sepolia
- **Chainlink Faucet**: https://faucets.chain.link/sepolia
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Recommended Amount**: 0.1 ETH for extensive testing

## 🚦 API Reference

### JavaScript Web3 Integration

#### Contract Initialization
```javascript
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, contractABI, signer);
```

#### Store Prescription
```javascript
async function storePrescription(fileHash) {
    const tx = await contract.storePrescription(fileHash);
    const receipt = await tx.wait();
    return receipt;
}
```

#### Verify Prescription
```javascript
async function verifyPrescription(fileHash) {
    const isValid = await contract.verifyPrescription(fileHash);
    return isValid;
}
```

#### File Hash Generation
```javascript
async function generateFileHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/PrescriptionValidation.test.js

# Run tests with gas reporting
REPORT_GAS=true npm test
```

### Test Coverage
- ✅ Smart contract deployment
- ✅ Prescription storage functionality
- ✅ Duplicate prevention logic
- ✅ Verification accuracy
- ✅ Gas consumption optimization
- ✅ Edge case handling

### Manual Testing Workflow
1. **Upload Test**: Select a sample prescription → Store on blockchain
2. **Positive Verification**: Upload same file → Should show "✅ Valid"
3. **Negative Verification**: Upload different file → Should show "❌ Invalid"
4. **Network Testing**: Switch networks → Should show appropriate warnings

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Modern blue/green gradient theme
- **Typography**: Inter font family for clean readability
- **Icons**: Font Awesome for consistent iconography
- **Animations**: Smooth transitions and loading states

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for medium screens
- **Desktop Experience**: Full-featured interface for large screens

### Accessibility
- **WCAG 2.1**: Compliant accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Semantic HTML for assistive technology

## 📈 Performance Optimization

### Frontend Optimization
- **Lazy Loading**: Images and components loaded on demand
- **Code Splitting**: JavaScript bundles optimized for faster loading
- **Caching Strategy**: Browser caching for static assets
- **Minification**: CSS and JavaScript files minified

### Blockchain Optimization
- **Gas Efficiency**: Optimized smart contract functions
- **Batch Operations**: Multiple prescriptions in single transaction
- **Event Indexing**: Efficient event log querying

## 🔄 Development Workflow

### Git Workflow
```bash
# Development branch
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request for review
```

### Deployment Process
1. **Local Testing**: Test on Hardhat local network
2. **Testnet Deployment**: Deploy to Sepolia for staging
3. **Frontend Update**: Update contract address in app.js
4. **User Testing**: Manual testing with real MetaMask transactions
5. **Production Ready**: Code review and final deployment

## 🚨 Troubleshooting

### Common Issues

#### MetaMask Connection Issues
```bash
# Check MetaMask network
ethereum.request({method: 'eth_chainId'})

# Verify Sepolia connection
# Should return: "0xaa36a7"
```

#### Smart Contract Errors
```bash
# Verify contract deployment
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS

# Check contract ABI
npx hardhat compile
```

#### Frontend Issues
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Check Ethers.js loading
typeof ethers !== "undefined"
```

## 📋 Environment Variables

Create a `.env` file with these variables:

```env
# Alchemy API Key (Get from alchemy.com)
ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY

# Wallet Private Key (Without 0x prefix)
PRIVATE_KEY=your-wallet-private-key-here

# Optional: Etherscan API Key for contract verification
ETHERSCAN_API_KEY=your-etherscan-api-key
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow Solidity style guide for smart contracts
- Use ESLint for JavaScript code formatting
- Write comprehensive tests for new features
- Update documentation for any API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin**: Security-audited smart contract libraries
- **Hardhat**: Ethereum development framework
- **MetaMask**: Web3 wallet integration
- **Alchemy**: Reliable Ethereum RPC provider
- **Font Awesome**: Icon library
- **Ethereum Foundation**: Blockchain infrastructure

## 📞 Support

For support and questions:

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- **Community**: [Discord Server](https://discord.gg/your-server)

***

