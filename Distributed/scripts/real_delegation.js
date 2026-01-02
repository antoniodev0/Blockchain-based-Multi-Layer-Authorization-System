const hre = require("hardhat");

// Funzione di utilità per creare pause reali nell'esecuzione (solo per scena)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log("--------------------------------------------------");
    console.log("[SCENARIO START] TEST DELEGA TEMPORANEA (10 SECONDI)");
    console.log("--------------------------------------------------");

    // *** AGGIORNA QUESTO INDIRIZZO DOPO IL REDEPLOY ***
    const TOP_ADDR = "0xe74541fd0076C8308447bcEA77E9f1E1039Df153"; 
    const DOC_ID = "TX_LAUREA_123";

    const signers = await hre.ethers.getSigners();
    const owner = signers[0];
    const delegate = signers[1];

    console.log(`[INFO] Owner:    ${owner.address}`);
    console.log(`[INFO] Delegate: ${delegate.address}`);
    console.log("--------------------------------------------------\n");

    const DelegationHub = await hre.ethers.getContractFactory("DelegationHub");
    const contract = DelegationHub.attach(TOP_ADDR);

    // STEP 1
    console.log("[STEP 1] Creazione Delega (Durata: 10 secondi)...");
    const txGrant = await contract.connect(owner).grantAccess(DOC_ID, delegate.address, 10, 1);
    await txGrant.wait();
    console.log("Status: Delega registrata.\n");

    // STEP 2
    console.log("[STEP 2] Verifica Immediata (Tempo: 0s)...");
    const txVerifySuccess = await contract.connect(delegate).verifyDocumentAccess(DOC_ID);
    await txVerifySuccess.wait();
    console.log("Result: Richiesta inviata. (Middleware DOVREBBE accettare)");
    
    // PAUSA SCENICA DI 5 SECONDI
    console.log("\n... Attesa reale di 5 secondi per lettura log ...");
    await sleep(5000); 

    // STEP 3 - VIAGGIO NEL TEMPO
    console.log("\n[SYSTEM] Manipolazione Blockchain: Avanzamento rapido di 15 secondi...");
    await network.provider.send("evm_increaseTime", [15]);
    await network.provider.send("evm_mine");
    console.log("Status: Tempo aggiornato. La delega è ora scaduta.\n");

    // STEP 4
    console.log("[STEP 3] Verifica Post-Scadenza (Tempo: +15s)...");
    const txVerifyFail = await contract.connect(delegate).verifyDocumentAccess(DOC_ID);
    await txVerifyFail.wait();
    console.log("Result: Richiesta inviata. (Middleware DOVREBBE rifiutare)");

    console.log("--------------------------------------------------");
    console.log("[SCENARIO END]");
    console.log("--------------------------------------------------");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });