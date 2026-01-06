const hre = require("hardhat");
const fs = require("fs");


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("--------------------------------------------------");
  console.log(" SCENARIO AVANZATO: SCADENZA TEMPORALE DELEGA");
  console.log("--------------------------------------------------");

  // 1. LOAD CONFIGURATION
  const config = JSON.parse(fs.readFileSync("config.json"));
  const TOP_ADDR = config.topLayer;
  const DOC_ID = "TX_LAUREA_123";

  // 2. IDENTITIES
  const signers = await hre.ethers.getSigners();
  const owner = signers[0];        // Me (Data owner)
  const university = signers[1];   // UniMe (Delegated entity)

  // 3. CONTRACT CONNECTION
  const DelegationHub = await hre.ethers.getContractFactory("DelegationHub");
  const contract = DelegationHub.attach(TOP_ADDR);

  // --- STEP 1: GRANT DELEGATION (10 Seconds) ---
  console.log(`\n [${new Date().toLocaleTimeString()}] delega l'Università per soli 10 SECONDI...`);
  
  const txGrant = await contract.connect(owner).grantAccess(
      DOC_ID, 
      university.address, 
      10, // Duration: 10 seconds
      1   // Depth level
  );
  await txGrant.wait();
  console.log("   Delega registrata su Blockchain.");

  // --- STEP 2: IMMEDIATE VERIFICATION (Success) ---
  console.log(`\n[${new Date().toLocaleTimeString()}] L'Università richiede accesso IMMEDIATO...`);
  
  const txVerify1 = await contract.connect(university).verifyDocumentAccess(DOC_ID);
  await txVerify1.wait();
  console.log("   Richiesta inviata.");

  // pause to let the middleware logs be read
  console.log("   ... Attesa lettura log (5s) ...");
  await sleep(5000);

  // --- STEP 3: TIME TRAVEL ---
  console.log("\n  [SYSTEM] Manipolazione Tempo EVM: +15 Secondi...");
  await network.provider.send("evm_increaseTime", [15]);
  await network.provider.send("evm_mine");
  console.log("   Tempo avanzato.");

  // --- STEP 4: EXPIRED VERIFICATION (Failure) ---
  console.log(`\n3️⃣  [${new Date().toLocaleTimeString()}] L'Università richiede accesso DOPO scadenza...`);
  
  const txVerify2 = await contract.connect(university).verifyDocumentAccess(DOC_ID);
  await txVerify2.wait();
  console.log("   Richiesta inviata.");
  
  console.log("\n--------------------------------------------------");
  console.log("FINE SCENARIO");
  console.log("--------------------------------------------------");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });