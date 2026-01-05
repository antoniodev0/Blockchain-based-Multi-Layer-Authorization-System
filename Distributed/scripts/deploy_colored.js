const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const EntityStorage = await hre.ethers.getContractFactory("EntityStorage");
  const contract = await EntityStorage.deploy();
  await contract.waitForDeployment();
  const address = contract.target;
  console.log("EntityStorage (Colored) address:", address);

  let config = {};
  if (fs.existsSync("config.json")) {
    config = JSON.parse(fs.readFileSync("config.json"));
  }
  config.coloredChain = address; // Aggiorniamo solo la colored chain
  fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });