const contractAddress = "0x4620d3c455F41e9500a2dF5bE69FDd819DF4B64C";

const contractABI = [
    "function storePrescription(bytes32 hash) public",
    "function verifyPrescription(bytes32 hash) public view returns (bool)",
    "event PrescriptionStored(bytes32 indexed hash, address indexed uploader, uint256 timestamp)"
];

let provider, signer, contract;

// Enhanced initialization with better error handling
async function initialize() {
    console.log('🚀 Initializing MedChain application...');
    
    if (!window.ethereum) {
        showNotification('MetaMask is not installed. Please install MetaMask extension.', 'error');
        updateConnectionStatus(false);
        return false;
    }

    // Check if ethers is loaded
    if (typeof ethers === 'undefined') {
        console.error('❌ Ethers.js not loaded');
        showNotification('Blockchain library not loaded. Please refresh the page.', 'error');
        return false;
    }
    
    try {
        // Request account access
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) {
            showNotification('No MetaMask accounts available. Please unlock MetaMask.', 'warning');
            updateConnectionStatus(false);
            return false;
        }

        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        // Validate network
        const network = await provider.getNetwork();
        console.log('🌐 Connected to network:', network.name, 'Chain ID:', network.chainId);
        
        if (network.chainId !== 11155111) { // Sepolia chainId
            showNotification('Please switch MetaMask to Sepolia testnet', 'warning');
            updateConnectionStatus(false);
            return false;
        }
        
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        // Test contract connection
        try {
            await contract.verifyPrescription("0x0000000000000000000000000000000000000000000000000000000000000000");
            console.log('✅ Contract connection successful');
        } catch (contractError) {
            console.warn('⚠️ Contract test failed (this is normal):', contractError.message);
        }
        
        const userAddress = await signer.getAddress();
        updateConnectionStatus(true, userAddress, network.name);
        showNotification('Successfully connected to MetaMask on Sepolia', 'success');
        
        console.log('✅ Initialization complete');
        console.log('📍 Address:', userAddress);
        console.log('📄 Contract:', contractAddress);
        
        return true;
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        
        let errorMessage = 'Failed to connect to MetaMask';
        if (error.code === 4001) {
            errorMessage = 'Connection rejected by user';
        } else if (error.code === -32002) {
            errorMessage = 'MetaMask connection request pending';
        }
        
        showNotification(errorMessage, 'error');
        updateConnectionStatus(false);
        return false;
    }
}

async function getFileHash(file) {
    try {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        console.error('Failed to compute hash', error);
        throw new Error('Could not compute file hash.');
    }
}

async function uploadPrescription() {
    const fileInput = document.getElementById('fileInput');
    const btn = document.getElementById('uploadBtn');
    
    if (!btn) {
        console.error('Upload button not found');
        showNotification('Upload button not found. Please refresh the page.', 'error');
        return;
    }
    
    const originalText = btn.innerHTML;

    if (!fileInput || !fileInput.files.length) {
        showNotification('Please select a file to upload.', 'warning');
        return;
    }
    
    const file = fileInput.files[0];

    // Enhanced file validation
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Only PDF, JPEG, and PNG files are allowed.', 'warning');
        return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
        showNotification('File size must be less than 10 MB.', 'warning');
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

        if (!contract) {
            console.log('🔄 Contract not initialized, attempting to connect...');
            const connected = await initialize();
            if (!connected) return;
        }

        const fileHash = await getFileHash(file);
        console.log('🔒 Generated file hash:', fileHash);
        showNotification('Generating transaction...', 'info');

        // Estimate gas first
        try {
            const gasEstimate = await contract.estimateGas.storePrescription(fileHash);
            console.log('⛽ Estimated gas:', gasEstimate.toString());
        } catch (gasError) {
            console.warn('⚠️ Gas estimation failed:', gasError.message);
        }

        const tx = await contract.storePrescription(fileHash);
        console.log('📡 Transaction sent:', tx.hash);
        showNotification('Transaction sent. Waiting for confirmation...', 'info');

        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        showNotification('Prescription uploaded successfully!', 'success');

        // Enhanced result display
        const uploadResult = document.getElementById('uploadResult');
        if (uploadResult) {
            uploadResult.innerHTML = `
                <div class='result-card success'>
                    <h3><i class="fas fa-check-circle"></i> Upload Successful</h3>
                    <div class="result-details">
                        <p><strong>File:</strong> ${file.name}</p>
                        <p><strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p><strong>Transaction Hash:</strong> 
                            <a href='https://sepolia.etherscan.io/tx/${tx.hash}' target='_blank' class="tx-link">
                                ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}
                            </a>
                        </p>
                        <p><strong>Block Number:</strong> ${receipt.blockNumber}</p>
                        <p><strong>Gas Used:</strong> ${receipt.gasUsed.toString()}</p>
                        <p><strong>Network:</strong> Sepolia Testnet</p>
                    </div>
                </div>
            `;
        }
        
        fileInput.value = '';
        updateFileInfo(null);

    } catch (err) {
        console.error('❌ Upload error:', err);
        let errorMessage = 'Upload failed';
        
        if (err.code === 4001) {
            errorMessage = 'Transaction rejected by user';
        } else if (err.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient ETH for gas fees';
        } else if (err.message.includes('reverted')) {
            errorMessage = 'Smart contract error - prescription may already exist';
        } else if (err.message.includes('network')) {
            errorMessage = 'Network error - please check your connection';
        } else {
            errorMessage = err.message;
        }
        
        showNotification(errorMessage, 'error');
        
        const uploadResult = document.getElementById('uploadResult');
        if (uploadResult) {
            uploadResult.innerHTML = `
                <div class='result-card error'>
                    <h3><i class="fas fa-exclamation-triangle"></i> Upload Failed</h3>
                    <p>${errorMessage}</p>
                    <p><small>Check browser console for more details</small></p>
                </div>
            `;
        }
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

async function verifyPrescription() {
    const fileInput = document.getElementById('verifyFileInput');
    const btn = document.getElementById('verifyBtn');
    
    if (!btn) {
        console.error('Verify button not found');
        showNotification('Verify button not found. Please refresh the page.', 'error');
        return;
    }
    
    const originalText = btn.innerHTML;

    if (!fileInput || !fileInput.files.length) {
        showNotification('Please select a file to verify.', 'warning');
        return;
    }
    
    const file = fileInput.files[0];

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

        if (!contract) {
            console.log('🔄 Contract not initialized, attempting to connect...');
            const connected = await initialize();
            if (!connected) return;
        }

        const fileHash = await getFileHash(file);
        console.log('🔍 Checking hash:', fileHash);
        showNotification('Checking blockchain...', 'info');

        const valid = await contract.verifyPrescription(fileHash);
        console.log('📋 Verification result:', valid ? 'VALID' : 'INVALID');

        const resultElement = document.getElementById('verifyResult');
        
        if (valid) {
            showNotification('Prescription verified successfully!', 'success');
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class='result-card success'>
                        <h3><i class="fas fa-shield-check"></i> Valid Prescription</h3>
                        <p>This prescription exists on the Sepolia blockchain</p>
                        <div class='result-details'>
                            <p><strong>File:</strong> ${file.name}</p>
                            <p><strong>Status:</strong> <span class="status-verified">✓ Verified on Sepolia</span></p>
                            <p><strong>Hash:</strong> <code>${fileHash.slice(0, 20)}...</code></p>
                            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                    </div>
                `;
            }
        } else {
            showNotification('Prescription not found on blockchain', 'error');
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class='result-card error'>
                        <h3><i class="fas fa-exclamation-circle"></i> Invalid Prescription</h3>
                        <p>This prescription was not found on the Sepolia blockchain</p>
                        <div class='result-details'>
                            <p><strong>File:</strong> ${file.name}</p>
                            <p><strong>Status:</strong> <span class="status-invalid">✗ Not Found</span></p>
                            <p><strong>Hash:</strong> <code>${fileHash.slice(0, 20)}...</code></p>
                            <p><strong>Checked:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                    </div>
                `;
            }
        }

    } catch (err) {
        console.error('❌ Verification error:', err);
        showNotification('Verification failed: ' + err.message, 'error');
        
        const resultElement = document.getElementById('verifyResult');
        if (resultElement) {
            resultElement.innerHTML = `
                <div class='result-card error'>
                    <h3><i class="fas fa-times-circle"></i> Verification Failed</h3>
                    <p>Error: ${err.message}</p>
                    <p><small>Check browser console for more details</small></p>
                </div>
            `;
        }
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    }[type] || '<i class="fas fa-info-circle"></i>';
    
    notification.innerHTML = `${icon} ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000); // Increased to 5 seconds for better readability
}

function updateConnectionStatus(connected, address = '', network = '') {
    const status = document.getElementById('connectionStatus');
    if (!status) {
        console.warn('⚠️ Connection status element not found');
        return;
    }
    
    if (connected) {
        status.innerHTML = `
            <span class='status connected'>
                <i class="fas fa-check-circle"></i> Connected: ${address.slice(0,6)}...${address.slice(-4)}
            </span> 
            <span class='network'>${network}</span>
        `;
        status.className = 'connection-status connected';
    } else {
        status.innerHTML = `
            <span class='status disconnected'>
                <i class="fas fa-times-circle"></i> Not Connected
            </span>
        `;
        status.className = 'connection-status disconnected';
    }
}

function updateFileInfo(file) {
    const info = document.getElementById('fileInfo');
    if (!info) return;
    
    if (!file) {
        info.style.display = 'none';
        return;
    }
    
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    const fileName = document.getElementById('fileName');
    const fileSizeEl = document.getElementById('fileSize');
    
    if (fileName) fileName.textContent = file.name;
    if (fileSizeEl) fileSizeEl.textContent = `${fileSize} MB`;
    
    info.style.display = 'block';
}

function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Enhanced event listeners with better error handling
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 MedChain application loading...');
    
    // Check for required elements
    const requiredElements = ['uploadBtn', 'verifyBtn', 'fileInput', 'verifyFileInput'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('❌ Missing required elements:', missingElements);
        showNotification('Application setup error. Please refresh the page.', 'error');
        return;
    }
    
    // Initialize connection with delay to ensure ethers is loaded
    setTimeout(() => {
        if (typeof ethers !== 'undefined') {
            console.log('✅ Ethers.js loaded successfully');
            initialize();
        } else {
            console.error('❌ Ethers.js not loaded');
            showNotification('Blockchain library failed to load. Please refresh the page.', 'error');
        }
    }, 1500); // Increased delay for better reliability
    
    // Set up file input handlers
    const fileInput = document.getElementById('fileInput');
    const verifyFileInput = document.getElementById('verifyFileInput');
    const uploadArea = document.getElementById('uploadArea');
    const verifyArea = document.getElementById('verifyUploadArea');

    if (fileInput) {
        fileInput.addEventListener('change', e => {
            updateFileInfo(e.target.files[0]);
        });
    }

    if (verifyFileInput) {
        verifyFileInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) {
                const verifyInfo = document.getElementById('verifyFileInfo');
                if (verifyInfo) {
                    verifyInfo.innerHTML = `
                        <div class='file-info'>
                            <i class="fas fa-file-medical"></i>
                            <span class='file-name'>${file.name}</span>
                            <span class='file-size'>${(file.size/1024/1024).toFixed(2)} MB</span>
                        </div>
                    `;
                    verifyInfo.style.display = 'block';
                }
            }
        });
    }

    // Enhanced drag and drop
    [uploadArea, verifyArea].forEach(area => {
        if (!area) return;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, e => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            area.addEventListener(eventName, () => {
                area.classList.add('dragover');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, () => {
                area.classList.remove('dragover');
            });
        });
        
        area.addEventListener('drop', e => {
            const files = e.dataTransfer.files;
            const targetInput = area.id === 'uploadArea' ? fileInput : verifyFileInput;
            
            if (targetInput && files.length > 0) {
                targetInput.files = files;
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    });

    // Button event listeners
    const uploadBtn = document.getElementById('uploadBtn');
    const verifyBtn = document.getElementById('verifyBtn');

    if (uploadBtn) {
        uploadBtn.addEventListener('click', uploadPrescription);
    }
    
    if (verifyBtn) {
        verifyBtn.addEventListener('click', verifyPrescription);
    }

    // MetaMask event handlers
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', accounts => {
            console.log('👤 Account changed:', accounts);
            if (accounts.length === 0) {
                updateConnectionStatus(false);
                showNotification('MetaMask disconnected', 'warning');
            } else {
                setTimeout(initialize, 500); // Small delay for stability
            }
        });

        window.ethereum.on('chainChanged', chainId => {
            console.log('🌐 Network changed to:', chainId);
            showNotification('Network changed. Refreshing application...', 'info');
            setTimeout(() => window.location.reload(), 1000);
        });
    }
    
    console.log('✅ Event listeners initialized');
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('🚨 Global error:', event.error);
    if (event.error.message.includes('ethers')) {
        showNotification('Blockchain library error. Please refresh the page.', 'error');
    }
});

// Make functions available globally for onclick handlers
window.scrollToSection = scrollToSection;
window.initialize = initialize;


