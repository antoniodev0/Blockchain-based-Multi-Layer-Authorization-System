const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const config = JSON.parse(fs.readFileSync("config.json"));
  const DOC_ID = "TX_LAUREA_123";

  const signers = await hre.ethers.getSigners();
  const owner = signers[0];    
  const university = signers[1]; 

  const DelegationHub = await hre.ethers.getContractFactory("DelegationHub");
  const contract = DelegationHub.attach(config.topLayer);

  console.log("--- INIZIO SCENARIO ---");

  // 1. Mario delegates to the University (1 hour)
  console.log(" Mario concede delega all'Università...");
  const txGrant = await contract.connect(owner).grantAccess(DOC_ID, university.address, 3600, 1);
  await txGrant.wait();
  console.log("   Delega registrata on-chain.");

  // 2. The University requests access
  console.log("Università richiede verifica accesso...");
  const txVerify = await contract.connect(university).verifyDocumentAccess(DOC_ID);
  await txVerify.wait();
  console.log("   Richiesta inviata.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });