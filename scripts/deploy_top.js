const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const DelegationHub = await hre.ethers.getContractFactory("DelegationHub");
  const contract = await DelegationHub.deploy();
  await contract.waitForDeployment();
  const address = contract.target;
  console.log("DelegationHub (Top) address:", address);

  // READ OR CREATE THE CONFIG
  let config = {};
  if (fs.existsSync("config.json")) {
    config = JSON.parse(fs.readFileSync("config.json"));
  }
  config.topLayer = address; // Update only the top layer
  fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });