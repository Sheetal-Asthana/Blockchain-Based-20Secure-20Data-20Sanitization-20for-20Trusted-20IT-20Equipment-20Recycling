// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ITAssetManager
 * @dev Smart contract for managing IT asset lifecycle with secure data sanitization proof
 * @author Blockchain-Based Secure Data Sanitization Team
 */
contract ITAssetManager is Ownable, ReentrancyGuard {
    
    // Asset status enumeration
    enum AssetStatus {
        REGISTERED,    // Asset is registered in the system
        SANITIZED,     // Asset has been securely wiped
        RECYCLED,      // Asset has been recycled
        SOLD          // Asset has been sold/transferred
    }
    
    // Asset data structure
    struct Asset {
        uint256 id;                    // Unique asset identifier
        string serialNumber;           // Device serial number
        string model;                  // Device model/type
        AssetStatus status;            // Current status of the asset
        string ipfsHash;               // IPFS hash of wipe log / sanitization evidence
        address technician;            // Who performed the sanitization
        uint256 carbonCredits;         // ESG impact tracking
        address owner;                 // Current owner of the device
        uint256 registrationTime;      // When asset was registered
        uint256 sanitizationTime;      // When asset was sanitized
        uint256 recyclingTime;         // When asset was recycled
    }
    
    // State variables
    uint256 private _assetIdCounter;
    mapping(uint256 => Asset) public assets;
    mapping(string => bool) private _serialNumberExists;
    mapping(string => uint256) private _serialToId;
    
    // Constants
    uint256 public constant CARBON_CREDITS_PER_RECYCLE = 10;
    
    // Events
    event AssetRegistered(
        uint256 indexed assetId,
        string serialNumber,
        string model,
        address indexed owner
    );
    
    event AssetSanitized(
        uint256 indexed assetId,
        string ipfsHash,
        uint256 timestamp
    );
    
    event AssetRecycled(
        uint256 indexed assetId,
        uint256 carbonCredits,
        uint256 timestamp
    );
    
    event AssetTransferred(
        uint256 indexed assetId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    // Custom errors for gas efficiency
    error AssetNotFound(uint256 assetId);
    error SerialNumberAlreadyExists(string serialNumber);
    error InvalidAssetStatus(uint256 assetId, AssetStatus currentStatus);
    error NotAssetOwner(uint256 assetId, address caller);
    error EmptyString(string paramName);
    error InvalidAddress(address addr);
    
    /**
     * @dev Constructor sets the deployer as the initial owner
     */
    constructor() Ownable(msg.sender) {
        _assetIdCounter = 1; // Start asset IDs from 1
    }
    
    /**
     * @dev Register a new IT asset in the system
     * @param serialNumber Unique serial number of the device
     * @param model Model/type of the device
     * @return assetId The unique ID assigned to the asset
     */
    function registerAsset(
        string calldata serialNumber,
        string calldata model
    ) external onlyOwner returns (uint256 assetId) {
        // Input validation
        if (bytes(serialNumber).length == 0) {
            revert EmptyString("serialNumber");
        }
        if (bytes(model).length == 0) {
            revert EmptyString("model");
        }
        if (_serialNumberExists[serialNumber]) {
            revert SerialNumberAlreadyExists(serialNumber);
        }
        
        // Create new asset
        assetId = _assetIdCounter++;
        
        assets[assetId] = Asset({
            id: assetId,
            serialNumber: serialNumber,
            model: model,
            status: AssetStatus.REGISTERED,
            ipfsHash: "",
            technician: address(0),
            carbonCredits: 0,
            owner: owner(),
            registrationTime: block.timestamp,
            sanitizationTime: 0,
            recyclingTime: 0
        });
        
        // Mark serial number as used
        _serialNumberExists[serialNumber] = true;
        _serialToId[serialNumber] = assetId;
        
        emit AssetRegistered(assetId, serialNumber, model, owner());
        
        return assetId;
    }
    
    /**
     * @dev Prove that an asset has been securely sanitized
     * @param assetId The ID of the asset to mark as sanitized
     * @param wipeLogHash IPFS hash or SHA256 of the sanitization log
     */
    function proveSanitization(
        uint256 assetId,
        string calldata wipeLogHash
    ) external {
        Asset storage asset = assets[assetId];
        
        // Validation
        if (asset.id == 0) {
            revert AssetNotFound(assetId);
        }
        if (asset.status != AssetStatus.REGISTERED) {
            revert InvalidAssetStatus(assetId, asset.status);
        }
        if (bytes(wipeLogHash).length == 0) {
            revert EmptyString("wipeLogHash");
        }
        
        // Update asset status and sanitization proof
        asset.status = AssetStatus.SANITIZED;
        asset.ipfsHash = wipeLogHash;
        asset.technician = msg.sender;
        asset.sanitizationTime = block.timestamp;
        
        emit AssetSanitized(assetId, wipeLogHash, block.timestamp);
    }

    /**
     * @dev Verify asset details by serial number (public view)
     * @param serialNumber The serial number to look up
     * @return asset The asset information
     */
    function verifyAsset(string calldata serialNumber) external view returns (Asset memory asset) {
        uint256 assetId = _serialToId[serialNumber];
        if (assetId == 0) {
            revert AssetNotFound(0);
        }
        asset = assets[assetId];
        return asset;
    }
    
    /**
     * @dev Mark an asset as recycled and award carbon credits
     * @param assetId The ID of the asset to recycle
     */
    function recycleAsset(uint256 assetId) external onlyOwner {
        Asset storage asset = assets[assetId];
        
        // Validation
        if (asset.id == 0) {
            revert AssetNotFound(assetId);
        }
        if (asset.status != AssetStatus.SANITIZED) {
            revert InvalidAssetStatus(assetId, asset.status);
        }
        
        // Update asset status and award carbon credits
        asset.status = AssetStatus.RECYCLED;
        asset.carbonCredits = CARBON_CREDITS_PER_RECYCLE;
        asset.recyclingTime = block.timestamp;
        
        emit AssetRecycled(assetId, CARBON_CREDITS_PER_RECYCLE, block.timestamp);
    }
    
    /**
     * @dev Transfer ownership of an asset (for resale)
     * @param assetId The ID of the asset to transfer
     * @param newOwner The address of the new owner
     */
    function transferAsset(
        uint256 assetId,
        address newOwner
    ) external nonReentrant {
        Asset storage asset = assets[assetId];
        
        // Validation
        if (asset.id == 0) {
            revert AssetNotFound(assetId);
        }
        if (asset.owner != msg.sender && msg.sender != owner()) {
            revert NotAssetOwner(assetId, msg.sender);
        }
        if (newOwner == address(0)) {
            revert InvalidAddress(newOwner);
        }
        if (asset.status != AssetStatus.SANITIZED && asset.status != AssetStatus.RECYCLED) {
            revert InvalidAssetStatus(assetId, asset.status);
        }
        
        address previousOwner = asset.owner;
        
        // Transfer ownership and update status
        asset.owner = newOwner;
        asset.status = AssetStatus.SOLD;
        
        emit AssetTransferred(assetId, previousOwner, newOwner, block.timestamp);
    }
    
    /**
     * @dev Get complete history and details of an asset
     * @param assetId The ID of the asset to query
     * @return asset The complete asset information
     */
    function getAssetHistory(uint256 assetId) external view returns (Asset memory asset) {
        asset = assets[assetId];
        if (asset.id == 0) {
            revert AssetNotFound(assetId);
        }
        return asset;
    }
    
    /**
     * @dev Get the current asset counter (total assets registered)
     * @return The current asset ID counter
     */
    function getTotalAssets() external view returns (uint256) {
        return _assetIdCounter - 1;
    }
    
    /**
     * @dev Check if a serial number is already registered
     * @param serialNumber The serial number to check
     * @return exists True if the serial number exists
     */
    function serialNumberExists(string calldata serialNumber) external view returns (bool exists) {
        return _serialNumberExists[serialNumber];
    }
    
    /**
     * @dev Get assets by status (view function for frontend filtering)
     * @param status The status to filter by
     * @param offset Starting index for pagination
     * @param limit Maximum number of results to return
     * @return assetIds Array of asset IDs matching the status
     */
    function getAssetsByStatus(
        AssetStatus status,
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory assetIds) {
        require(limit > 0 && limit <= 100, "Invalid limit"); // Prevent gas issues
        
        uint256[] memory tempIds = new uint256[](limit);
        uint256 count = 0;
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i < _assetIdCounter && count < limit; i++) {
            if (assets[i].status == status) {
                if (currentIndex >= offset) {
                    tempIds[count] = i;
                    count++;
                }
                currentIndex++;
            }
        }
        
        // Create properly sized array
        assetIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            assetIds[i] = tempIds[i];
        }
        
        return assetIds;
    }
}