const hre = require("hardhat");
const fs = require("fs");
const iam = require("./iam_check"); // Use the IAM library

async function main() {
  const config = JSON.parse(fs.readFileSync("config.json"));
  
  // Provider
  const providerTop = new hre.ethers.JsonRpcProvider("http://127.0.0.1:7545");
  const providerCol = new hre.ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Contratti
  const TopArtifact = await hre.artifacts.readArtifact("DelegationHub");
  const ColArtifact = await hre.artifacts.readArtifact("EntityStorage");
  const topContract = new hre.ethers.Contract(config.topLayer, TopArtifact.abi, providerTop);
  const colContract = new hre.ethers.Contract(config.coloredChain, ColArtifact.abi, providerCol);

  console.log("MIDDLEWARE ATTIVO (Blockchain + Keycloak)...");

  // LISTENER
  topContract.on("AccessCheckResult", async (txHash, requestor, allowed) => {
    if (!allowed) {
        console.log(`BLOCKCHAIN: Accesso negato dallo Smart Contract per ${requestor}`);
        return;
    }

    console.log(`\n🔔 BLOCKCHAIN: Accesso Consentito (Delega OK).`);
    console.log("👮 IAM: Controllo identità utente fisico...");

    if (!fs.existsSync("user_token.jwt")) {
        console.log("ERRORE: Nessun utente loggato.");
        return;
    }

    const token = fs.readFileSync("user_token.jwt", "utf8");
    const check = await iam.checkUser(token);

    if (check.authorized) {
        console.log(`IAM: Utente autorizzato (${check.role}). Recupero dati...`);
        try {
            const doc = await colContract.getDocument(txHash);
            console.log("DATI RESTITUITI ALL'UTENTE:");
            console.log(`   - Descrizione: ${doc[2]}`);
            console.log(`   - IPFS: ${doc[0]}`);
            console.log(`   - MD5:  ${doc[1]}`);
        } catch (e) { console.error("Errore storage:", e.message); }
    } else {
        console.log(`IAM: Bloccato. Ruolo '${check.role}' insufficiente.`);
    }
  });
}
main().catch((error) => { console.error(error); process.exitCode = 1; });