// SPDX-License-Identifier: MIT
// per la colored chain
pragma solidity ^0.8.0;

contract EntityStorage {
    struct Document {
        string ipfsHash;    // Link al file reale
        string description; // Descrizione (es. Laurea)
        bool exists;        // Controllo rapido
        uint256 timestamp;  
    }

    mapping(string => Document) public documents;

    // Evento fondamentale per la "Pipeline"
    event DocumentStored(string indexed txHash, string description);

    // Salva un documento
    function storeDocument(string memory _txHash, string memory _ipfsHash, string memory _description) public {
        require(!documents[_txHash].exists, "Documento gia' esistente");

        documents[_txHash] = Document({
            ipfsHash: _ipfsHash,
            description: _description,
            exists: true,
            timestamp: block.timestamp
        });

        emit DocumentStored(_txHash, _description);
    }

    // Leggi un documento (chiamata dal Middleware)
    function getDocument(string memory _txHash) public view returns (string memory, string memory, uint256) {
        require(documents[_txHash].exists, "Documento non trovato");
        Document memory doc = documents[_txHash];
        return (doc.ipfsHash, doc.description, doc.timestamp);
    }
}