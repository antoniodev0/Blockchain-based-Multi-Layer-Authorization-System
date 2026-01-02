const hre = require("hardhat");

async function main() {
  console.log("Avvio del Middleware (Il Ponte tra le Blockchain)...");

  // 1. CONFIGURAZIONE INDIRIZZI (Quelli che mi hai dato)
  const TOP_LAYER_ADDR = "0xe74541fd0076C8308447bcEA77E9f1E1039Df153";
  const COLORED_CHAIN_ADDR = "0x3B040f17b35131BFac1d74A341b601439c95465b";

  // 2. CONFIGURAZIONE PROVIDER (Le connessioni alle due porte)
  // Usiamo JsonRpcProvider per connetterci manualmente alle due porte diverse
  const providerTop = new hre.ethers.JsonRpcProvider("http://127.0.0.1:7545");
  const providerColored = new hre.ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // 3. RECUPERO GLI "ARTIFACTS" (Il libretto di istruzioni dei contratti)
  const TopArtifact = await hre.artifacts.readArtifact("DelegationHub");
  const ColoredArtifact = await hre.artifacts.readArtifact("EntityStorage");

  // 4. CREAZIONE DELLE ISTANZE DEI CONTRATTI (In sola lettura per il middleware)
  const topContract = new hre.ethers.Contract(TOP_LAYER_ADDR, TopArtifact.abi, providerTop);
  const coloredContract = new hre.ethers.Contract(COLORED_CHAIN_ADDR, ColoredArtifact.abi, providerColored);

  console.log("In ascolto di eventi sulla Top Layer (Porta 7545)...");

  // 5. IL CUORE DELLA PIPELINE: ASCOLTO EVENTI
  // Ascoltiamo l'evento "AccessCheckResult" emesso dalla funzione verifyDocumentAccess
  topContract.on("AccessCheckResult", async (txHash, requestor, allowed) => {
    console.log(`\n🔔 EVENTO RICEVUTO DALLA TOP LAYER!`);
    console.log(`   - Richiedente: ${requestor}`);
    console.log(`   - Hash Documento Richiesto: ${txHash}`);
    console.log(`   - Accesso Consentito? ${allowed ? "SÌ" : "NO"}`);

    if (allowed) {
      console.log("Attivazione Pipeline verso Colored Chain...");
      
      try {
        // Interrogo la Colored Chain (Porta 8545)
        const docData = await coloredContract.getDocument(txHash);
        
        console.log("\nDOCUMENTO RECUPERATO CON SUCCESSO:");
        console.log("   ------------------------------------------------");
        console.log(`   [IPFS Link]:   ${docData[0]}`); // Primo valore di ritorno
        console.log(`   [Descrizione]: ${docData[1]}`); // Secondo valore
        console.log(`   [Timestamp]:   ${docData[2]}`); // Terzo valore
        console.log("   ------------------------------------------------");
        console.log("Pipeline completata. Dati inviati all'utente.\n");

      } catch (error) {
        console.error("⚠️ Errore: Impossibile trovare il documento sulla Colored Chain (o errore di connessione).");
        // console.error(error); // Decommenta per dettagli tecnici
      }
    } else {
      console.log("Pipeline bloccata: L'utente non ha i permessi.");
    }
  });
}

// Gestione errori avvio
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});