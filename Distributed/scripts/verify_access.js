const hre = require("hardhat");

async function main() {
  const TOP_ADDR = "0xe74541fd0076C8308447bcEA77E9f1E1039Df153";
  const DelegationHub = await hre.ethers.getContractFactory("DelegationHub");
  const contract = DelegationHub.attach(TOP_ADDR);
  const [owner, university] = await hre.ethers.getSigners();

  console.log("Gestione Permessi su Top Layer...");

  // 1. L'Owner (Tu) dà il permesso all'Università (usiamo il signer[0] come owner e signer[0] come uni per semplicità, o signer[1])
  // Per semplicità della demo, facciamo che chi lancia lo script è sia owner che richiedente per ora.
  
  console.log("   -> Concedo delega per 'TX_LAUREA_123'...");
  const txGrant = await contract.grantAccess(
      "TX_LAUREA_123", 
      owner.address, // Deleghiamo noi stessi per il test (o metti university.address)
      60, // 60 minuti
      1   // Profondità 1
  );
  await txGrant.wait();
  console.log("   Delega concessa.");

  // 2. L'Università (sempre tu per il test) richiede la verifica
  console.log("[UNIVERSITA'] Richiedo verifica accesso...");
  // Nota: questa chiamata non restituisce dati, ma EMETTE L'EVENTO che il middleware ascolta
  const txVerify = await contract.verifyDocumentAccess("TX_LAUREA_123");
  await txVerify.wait();
  
  console.log("   Richiesta inviata! Controlla il terminale del Middleware!");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });