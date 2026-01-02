const hre = require("hardhat");

async function main() {
  console.log("Inizio il deploy su TOP LAYER...");

  // Prende il contratto compilato
  const DelegationHub = await hre.ethers.getContractFactory("DelegationHub");
  
  // Lo invia alla blockchain
  const contract = await DelegationHub.deploy();

  // Attende che sia confermato
  await contract.waitForDeployment();

  console.log("DelegationHub deployato con successo!");
  console.log("INDIRIZZO CONTRATTO (Salviamolo):", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});