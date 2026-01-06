// SPDX-License-Identifier: MIT
// for the top layer

pragma solidity ^0.8.0;

contract DelegationHub {
    
    // Multi-Level Delegation Structure
    struct Permission {
        bool isValid;           
        uint256 expiryTime;     
        uint8 delegationDepth;
    }

    // Mapping: DocumentHash => (DelegateAddress => Permission)
    mapping(string => mapping(address => Permission)) public documentPermissions;

    // Events that trigger the pipeline in the Middleware
    event AccessGranted(string indexed txHash, address indexed user, uint8 level);
    event AccessCheckResult(string txHash, address indexed requestor, bool allowed);

    // Grant access (or Delegation)
    function grantAccess(string memory _txHash, address _delegate, uint256 _secondsDuration, uint8 _depth) public {
        // Here we simplify: anyone can create a delegation for demo purposes.
        // In production, a check would be needed: require(msg.sender == owner)
        
        uint256 expiry = block.timestamp + _secondsDuration;
        
        documentPermissions[_txHash][_delegate] = Permission({
            isValid: true,
            expiryTime: expiry,
            delegationDepth: _depth
        });

        emit AccessGranted(_txHash, _delegate, _depth);
    }

    // Verify Access
    function verifyDocumentAccess(string memory _txHash) public {
        Permission memory perm = documentPermissions[_txHash][msg.sender];

        bool allowed = false;

        // Verify validity and temporal expiration
        if (perm.isValid && block.timestamp <= perm.expiryTime) {
            allowed = true;
        }

        // EMITS THE EVENT: The Node.js Middleware will listen to this!
        // If allowed is TRUE, the middleware will go to the other blockchain.
        emit AccessCheckResult(_txHash, msg.sender, allowed);
    }
}