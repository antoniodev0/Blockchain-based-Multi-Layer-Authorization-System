const hre = require("hardhat");

async function main() {
  const COL_ADDR = "0x3B040f17b35131BFac1d74A341b601439c95465b";
  const EntityStorage = await hre.ethers.getContractFactory("EntityStorage");
  const contract = EntityStorage.attach(COL_ADDR);

  console.log("Caricamento Dati su Colored Chain...");
  
  const tx = await contract.storeDocument(
      "TX_LAUREA_123",              // ID Transazione/Documento
      "ipfs://bafy...pdf",          // Link al file
      "Certificato Laurea Magistrale" // Descrizione
  );
  await tx.wait();
  
  console.log("Documento salvato! ID: TX_LAUREA_123");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });