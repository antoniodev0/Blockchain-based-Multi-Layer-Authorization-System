# Blockchain-based Multi-Layer Authorization System

Questo progetto implementa un'architettura Cross-Chain per la gestione sicura di dati sensibili (come certificati accademici) utilizzando il paradigma Top Layer (Governance) e Colored Chains (Storage).

L'obiettivo è risolvere le problematiche di privacy e scalabilità separando la logica di autorizzazione dalla memorizzazione fisica dei dati, permettendo una gestione granulare dei permessi tramite Smart Contracts.

## Architettura del Sistema

Il sistema si basa su due Blockchain distinte che comunicano attraverso un Middleware off-chain, realizzando una pipeline di esecuzione:

1.  **Top Layer (Governance Chain - Porta 7545)**
    *   Gestisce le Identità e i Permessi (Delega).
    *   Ospita lo Smart Contract `DelegationHub`.
    *   Non contiene dati sensibili, ma solo le regole di accesso e gli hash di verifica.

2.  **Colored Chain (Data Chain - Porta 8545)**
    *   Rappresenta la blockchain privata di un ente specifico (es. Università).
    *   Ospita lo Smart Contract `EntityStorage`.
    *   Contiene i metadati dei documenti (Hash, Link IPFS).

3.  **Middleware (Pipeline Bridge)**
    *   Un servizio Node.js che ascolta gli eventi sulla Top Layer.
    *   Agisce come un oracolo inverso: interroga la Colored Chain solo se rileva un evento di autorizzazione valido sulla Top Layer.

---

## Struttura del Progetto e Descrizione File

Di seguito viene spiegata la funzione di ogni file presente nel progetto.

### Smart Contracts (Cartella `contracts/`)

*   **`DelegationHub.sol` (Top Layer)**
    *   **Scopo:** Gestisce il controllo degli accessi (RBAC - Role Based Access Control).
    *   **Funzionamento:** Permette agli utenti di delegare enti terzi per un periodo di tempo limitato. Quando un ente richiede l'accesso, questo contratto verifica la validità della delega ed emette l'evento `AccessCheckResult`. Questo evento è il segnale che attiva il Middleware.

*   **`EntityStorage.sol` (Colored Chain)**
    *   **Scopo:** Funge da registro immutabile per i documenti.
    *   **Funzionamento:** Associa un identificativo di transazione (TX Hash) ai dati reali (es. Link IPFS). Viene interrogato dal Middleware solo dopo che la verifica sul Top Layer ha avuto successo.

### Script di Integrazione (Cartella `scripts/`)

*   **`middleware.js`**
    *   È il componente centrale del progetto. Connette le due blockchain.
    *   Rimane in ascolto sulla porta 7545 (Top Layer). Quando riceve l'evento di accesso consentito, esegue una chiamata verso la porta 8545 (Colored Chain) per recuperare il documento. Realizza concretamente il concetto di "Pipeline".

*   **`upload_data.js`**
    *   Script utilizzato dal proprietario dei dati per caricare un nuovo certificato sulla Colored Chain.

*   **`verify_access.js`**
    *   Script utilizzato dall'ente verificatore (es. Università). Interagisce solo con la Top Layer per richiedere il permesso di lettura.

*   **`deploy_top.js` & `deploy_colored.js`**
    *   Script di configurazione per pubblicare i contratti sulle rispettive blockchain.

---

## Guida all'Installazione

### Prerequisiti
*   Node.js installato.
*   Framework Hardhat configurato.

### 1. Avvio delle Blockchain Simulate
Aprire due terminali separati per avviare le istanze locali di Ganache.

**Terminale A (Top Layer):**

npx ganache --server.port 7545 --chain.chainId 1337 --chain.networkId 5777 --wallet.totalAccounts 10

**Terminale B (Colored Chain):**

npx ganache --server.port 8545 --chain.chainId 1337 --chain.networkId 5777 --wallet.totalAccounts 10

### 2. Pubblicazione dei contratti (Deploy)
In un terzo terminale, eseguire i seguenti comandi per caricare gli smart contracts:
 - npx hardhat run scripts/deploy_top.js --network topLayer
 - npx hardhat run scripts/deploy_colored.js --network coloredChain
Dopo il deploy, copiare gli indirizzi dei contratti generati e aggiornatli nelle costanti presenti nel file "middleware.js", "upload_data.js" e "verify_access.js".

### 3. Esecuzione della Demo (scenario)

1. Caricamento del dato: l'utente carica il certificato sulla blockchain di storage (colored chain)
    - npx hardhat run scripts/upload_data.js --network coloredChain

2. Avvio del middleware: avviare il servizio in ascolto. Il terminale rimarrà in ascolto di eventi
    - npx hardhat run scripts/middleware.js --network topLayer

3. Richiesta di verifica: apriamo un nuovo terminale, l'ente terzo richiede l'accesso sulla blockchain di governance (Top Layer)
    - npx hardhat run scripts/verify_access.js --network topLayer

Sul terminale del middleware verranno visualizzati i seguenti log in sequenza:
1. Ricezione dell'evento dal top layer
2. Conferma che l'accesso è consentito
3. Attivazione della connessione verso la colored chain
4. Recupero e visualizzazione dei dati del documento (link e descrizione)

L'architettura garantisce che nessun attore possa interrogare direttamente i dati sensibili senza passare prima per il controllo dei permessi sulla top layer, simulando un sistema di sicurezza a livelli.

### 4. Scenario avanzato con delega e scadenza
Questo script simula un caso d'uso reale con due identità distinte e manipolazione temporale:
1) L'owner delega l'università per una durata di 10 secondi
2) L'università effettua un accesso immediato
3) Il sistema simula un salto temporale sulla blockchain di 15 secondi
4) L'università tenta un nuovo accesso a delega scaduta