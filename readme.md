# Blockchain-based Multi-Layer Authorization System

Questo progetto implementa un'architettura Cross-Chain integrata con un sistema IAM (Identity and Access Management) per la gestione sicura di dati sensibili. Utilizza un paradigma a livelli che separa la governance, lo storage dei dati e l'identità degli utenti fisici.

## Architettura del Sistema

Il sistema si compone di quattro pilastri fondamentali:

1.  **Top Layer (Governance Chain - Porta 7545)**
    *   Blockchain pubblica (simulata) per la gestione delle deleghe tra enti.
    *   Ospita lo Smart Contract `DelegationHub`.

2.  **Colored Chain (Data Chain - Porta 8545)**
    *   Blockchain privata per lo storage dei metadati documentali.
    *   Ospita lo Smart Contract `EntityStorage` (include Hash IPFS e MD5).

3.  **Identity Provider (Keycloak - Docker)**
    *   Gestisce l'autenticazione degli utenti fisici (es. dipendenti dell'ente).
    *   Fornisce token JWT con ruoli specifici (es. `admin_documenti`, `stagista`).

4.  **Middleware (Pipeline Bridge)**
    *   Servizio Node.js che orchestra il flusso. Ascolta la Blockchain, verifica il Token IAM dell'utente e, solo se entrambi i controlli passano, recupera i dati dallo storage.

---

## Struttura del Progetto e Descrizione File

### Smart Contracts (Cartella `contracts/`)
*   **`DelegationHub.sol`**: Gestisce le deleghe temporali multilivello. Emette l'evento `AccessCheckResult` usato come trigger.
*   **`EntityStorage.sol`**: Registro immutabile dei documenti. Salva Link IPFS, Hash MD5 e Descrizione.

### Script Operativi (Cartella `scripts/`)
*   **`middleware.js`**: Il cuore del sistema. Unisce il mondo Blockchain con quello IAM.
*   **`iam_login.js`**: Client per effettuare il login su Keycloak e ottenere il token JWT locale.
*   **`run_scenario.js`**: Esegue lo scenario di verifica (L'ente richiede accesso alla Top Layer).
*   **`setup_storage.js`**: Carica un documento iniziale sulla Colored Chain per i test.
*   **`deploy_top.js` & `deploy_colored.js`**: Script di deploy che generano automaticamente il file `config.json`.

---

## Guida all'Installazione

### Prerequisiti
*   Node.js & NPM
*   Docker Desktop (per Keycloak)
*   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox (usare la versione 2.22.0)

### Configurazione Keycloak
Una volta avviato Docker, è necessario configurare il realm e gli utenti.
1.  Accedere a **http://localhost:8080** (Username: `admin`, Password: `admin`).
2.  **Creare il Realm**:
    *   Cliccare sul menu a tendina in alto a sinistra (dove dice "Keycloak").
    *   Cliccare **Create Realm**.
    *   Nome: `unime-realm`. Cliccare **Create**.
3.  **Creare il Client**:
    *   Menu laterale **Clients** -> **Create client**.
    *   Client ID: `blockchain-app`.
    *   Cliccare **Next** due volte e poi **Save**.
    *   Nel tab **Settings** del client appena creato, assicurarsi che **Direct access grants** sia su **On** (necessario per il login da terminale). Cliccare **Save**.
4.  **Creare i Ruoli**:
    *   Menu laterale **Realm roles** -> **Create role**.
    *   Nome: `admin_documenti`. Salva.
    *   Creare un secondo ruolo nome: `stagista`. Salva.
5.  **Creare gli Utenti**:
    *   Menu laterale **Users** -> **Add user**.
    *   Username: `y`. Cliccare **Create**.
    *   Tab **Credentials** -> **Set password** -> Inserire `abc` (disattivare "Temporary") -> Save.
    *   Tab **Role mapping** -> **Assign role** -> Selezionare `admin_documenti` -> Assign.
    *   Ripetere la procedura per l'utente `x` con password `xyz` assegnando il ruolo `stagista`.

### 1. Avvio dell'Infrastruttura
Aprire due terminali separati.

- Terminale A (Top Layer Blockchain): npx ganache --server.port 7545 --chain.chainId 1337 --chain.networkId 5777 --wallet.totalAccounts 10
- Terminale B (Colored Chain Blockchain) npx ganache --server.port 7545 --chain.chainId 1337 --chain.networkId 5777 --wallet.totalAccounts 10

### 2. Setup e Deploy
In un terzo terminale eseguire la configurazione iniziale:
- npx hardhat compile
- npx hardhat run scripts/deploy_top.js --network topLayer
- npx hardhat run scripts/deploy_colored.js --network coloredChain

Caricamento dati di test:
- npx hardhat run scripts/setup_storage.js --network coloredChain

### 3. Esecuzione della demo
In un terminale avviare il middleware:
- npx hardhat run scripts/middleware.js --network topLayer

In un secondo terminale:
1) Ci loggiamo: node scripts/iam_login.js francesco 1234 (esempio)
2) run simulazione: npx hardhat run scripts/run_scenario.js --network topLayer

## Concetti chiave
L'esecuzione dello Smart Contract sulla Colored Chain (recupero dati) è vincolata all'output positivo dello Smart Contract sulla Top Layer.
Il sistema implementa una sicurezza granulare:

1. Livello Ente (Smart Contract): L'Università ha il permesso di accedere ai dati?
2. Livello Utente (Keycloak): La persona specifica dentro l'Università è autorizzata?
Solo se entrambi i livelli danno "Sì", il dato viene decifrato/restituito.