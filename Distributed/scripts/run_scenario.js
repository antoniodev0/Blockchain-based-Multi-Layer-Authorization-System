const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const config = JSON.parse(fs.readFileSync("config.json"));
  const DOC_ID = "TX_LAUREA_123";

  const signers = await hre.ethers.getSigners();
  const owner = signers[0];    // Mario
  const university = signers[1]; // UniMe

  const DelegationHub = await hre.ethers.getContractFactory("DelegationHub");
  const contract = DelegationHub.attach(config.topLayer);

  console.log("--- INIZIO SCENARIO ---");

  // 1. Mario delega l'Università (1 ora)
  console.log(" Mario concede delega all'Università...");
  const txGrant = await contract.connect(owner).grantAccess(DOC_ID, university.address, 3600, 1);
  await txGrant.wait();
  console.log("   ✅ Delega registrata on-chain.");

  // 2. L'Università richiede l'accesso
  console.log("Università richiede verifica accesso...");
  const txVerify = await contract.connect(university).verifyDocumentAccess(DOC_ID);
  await txVerify.wait();
  console.log("   ✅ Richiesta inviata. (Il risultato dipende da chi è loggato nel Middleware)");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });