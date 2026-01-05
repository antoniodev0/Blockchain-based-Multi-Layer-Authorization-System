const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const config = JSON.parse(fs.readFileSync("config.json"));
  const EntityStorage = await hre.ethers.getContractFactory("EntityStorage");
  const contract = EntityStorage.attach(config.coloredChain);

  console.log("📤 Caricamento Documento su Storage...");
  try {
      const tx = await contract.storeDocument(
          "TX_LAUREA_123",              
          "ipfs://bafy...pdf",          
          "5d41402abc4b2a76b9719d911017c592", // MD5
          "Laurea Magistrale Informatica" 
      );
      await tx.wait();
      console.log("Documento salvato.");
  } catch (e) { console.log("⚠️ Documento già esistente."); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });