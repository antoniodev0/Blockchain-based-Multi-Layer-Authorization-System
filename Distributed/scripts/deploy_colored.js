const hre = require("hardhat");

async function main() {
  console.log("Inizio il deploy su COLORED CHAIN...");

  const EntityStorage = await hre.ethers.getContractFactory("EntityStorage");
  const contract = await EntityStorage.deploy();

  await contract.waitForDeployment();

  console.log("EntityStorage deployato con successo!");
  console.log("INDIRIZZO CONTRATTO (Salviamolo):", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});