// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EntityStorage {
    struct Document {
        string ipfsHash;    
        string md5Hash;     // <--- NUOVO CAMPO
        string description; 
        bool exists;        
        uint256 timestamp;  
    }

    mapping(string => Document) public documents;

    event DocumentStored(string indexed txHash, string description);

    // Abbiamo aggiunto _md5Hash nei parametri
    function storeDocument(string memory _txHash, string memory _ipfsHash, string memory _md5Hash, string memory _description) public {
        require(!documents[_txHash].exists, "Documento gia' esistente");

        documents[_txHash] = Document({
            ipfsHash: _ipfsHash,
            md5Hash: _md5Hash, // <--- Salvataggio
            description: _description,
            exists: true,
            timestamp: block.timestamp
        });

        emit DocumentStored(_txHash, _description);
    }

    // Restituisce anche l'MD5
    function getDocument(string memory _txHash) public view returns (string memory, string memory, string memory, uint256) {
        require(documents[_txHash].exists, "Documento non trovato");
        Document memory doc = documents[_txHash];
        // Restituisce: IPFS, MD5, Descrizione, Timestamp
        return (doc.ipfsHash, doc.md5Hash, doc.description, doc.timestamp);
    }
}