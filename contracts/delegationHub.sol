// SPDX-License-Identifier: MIT
// per la top layer

pragma solidity ^0.8.0;

contract DelegationHub {
    
    // Struttura della Delega Multilivello
    struct Permission {
        bool isValid;           
        uint256 expiryTime;     
        uint8 delegationDepth;  // 0 = Utente finale, 1 = Può delegare, 2 = Super Admin...
    }

    // Mapping: HashDelDocumento => (IndirizzoDelegato => Permesso)
    mapping(string => mapping(address => Permission)) public documentPermissions;

    // Eventi che attivano la pipeline nel Middleware
    event AccessGranted(string indexed txHash, address indexed user, uint8 level);
    event AccessCheckResult(string txHash, address indexed requestor, bool allowed);

    // Concedi accesso (o Delega)
    function grantAccess(string memory _txHash, address _delegate, uint256 _secondsDuration, uint8 _depth) public {
        // Qui semplifichiamo: chiunque può creare una delega per demo.
        // In produzione servirebbe un check: require(msg.sender == owner)
        
        uint256 expiry = block.timestamp + _secondsDuration;
        
        documentPermissions[_txHash][_delegate] = Permission({
            isValid: true,
            expiryTime: expiry,
            delegationDepth: _depth
        });

        emit AccessGranted(_txHash, _delegate, _depth);
    }

    // Verifica Accesso (Chiamata dall'Università)
    function verifyDocumentAccess(string memory _txHash) public {
        Permission memory perm = documentPermissions[_txHash][msg.sender];

        bool allowed = false;

        // Verifica validità e scadenza temporale
        if (perm.isValid && block.timestamp <= perm.expiryTime) {
            allowed = true;
        }

        // EMETTE L'EVENTO: Il Middleware Node.js ascolterà questo!
        // Se allowed è TRUE, il middleware andrà sull'altra blockchain.
        emit AccessCheckResult(_txHash, msg.sender, allowed);
    }
}