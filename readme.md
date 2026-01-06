# Blockchain-based Multi-Layer Authorization System

This project implements a Cross-Chain architecture integrated with an IAM (Identity and Access Management) system for secure management of sensitive data. It uses a layered paradigm that separates governance, data storage, and physical user identity.

## System Architecture

The system consists of four fundamental pillars:

1.  **Top Layer (Governance Chain - Port 7545)**
    *   Public (simulated) blockchain for managing delegations between entities.
    *   Hosts the `DelegationHub` Smart Contract.

2.  **Colored Chain (Data Chain - Port 8545)**
    *   Private blockchain for document metadata storage.
    *   Hosts the `EntityStorage` Smart Contract (includes IPFS Hash and MD5).

3.  **Identity Provider (Keycloak - Docker)**
    *   Manages authentication of physical users (e.g., entity employees).
    *   Provides JWT tokens with specific roles (e.g., `admin_documenti`, `stagista`).

4.  **Middleware (Pipeline Bridge)**
    *   Node.js service that orchestrates the flow. It listens to the Blockchain, verifies the user's IAM Token, and only if both checks pass, retrieves the data from storage.

---

## Project Structure and File Description

### Smart Contracts (`contracts/` folder)
*   **`DelegationHub.sol`**: Manages multi-level temporal delegations. Emits the `AccessCheckResult` event used as a trigger.
*   **`EntityStorage.sol`**: Immutable document registry. Stores IPFS Link, MD5 Hash, and Description.

### Operational Scripts (`scripts/` folder)
*   **`middleware.js`**: The heart of the system. Bridges the Blockchain world with IAM.
*   **`iam_login.js`**: Client for logging into Keycloak and obtaining a local JWT token.
*   **`run_scenario.js`**: Executes the verification scenario (The entity requests access to the Top Layer).
*   **`scenario_expiration.js`**: Advanced scenario demonstrating temporal delegation expiration with EVM time manipulation.
*   **`setup_storage.js`**: Loads an initial document to the Colored Chain for testing.
*   **`deploy_top.js` & `deploy_colored.js`**: Deployment scripts that automatically generate the `config.json` file.

---

## Installation Guide

### Prerequisites
*   Node.js & NPM
*   Docker Desktop (for Keycloak)
*   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox (use version 2.22.0)

### Keycloak Configuration
Once Docker is started, you need to configure the realm and users.
1.  Access **http://localhost:8080** (Username: `admin`, Password: `admin`).
2.  **Create the Realm**:
    *   Click on the dropdown menu in the top left corner (where it says "Keycloak").
    *   Click **Create Realm**.
    *   Name: `unime-realm`. Click **Create**.
3.  **Create the Client**:
    *   Side menu **Clients** -> **Create client**.
    *   Client ID: `blockchain-app`.
    *   Click **Next** twice and then **Save**.
    *   In the **Settings** tab of the newly created client, ensure that **Direct access grants** is **On** (required for terminal login). Click **Save**.
4.  **Create the Roles**:
    *   Side menu **Realm roles** -> **Create role**.
    *   Name: `admin_documenti`. Save.
    *   Create a second role named: `stagista`. Save.
5.  **Create the Users**:
    *   Side menu **Users** -> **Add user**.
    *   Username: `y`. Click **Create**.
    *   **Credentials** tab -> **Set password** -> Enter `abc` (disable "Temporary") -> Save.
    *   **Role mapping** tab -> **Assign role** -> Select `admin_documenti` -> Assign.
    *   Repeat the procedure for user `x` with password `xyz` assigning the `stagista` role.

### 1. Starting the Infrastructure
Open two separate terminals.

- Terminal A (Top Layer Blockchain): npx ganache --server.port 7545 --chain.chainId 1337 --chain.networkId 5777 --wallet.totalAccounts 10
- Terminal B (Colored Chain Blockchain): npx ganache --server.port 8545 --chain.chainId 1338 --chain.networkId 5778 --wallet.totalAccounts 10

### 2. Setup and Deploy
In a third terminal, execute the initial configuration:
- npx hardhat compile
- npx hardhat run scripts/deploy_top.js --network topLayer
- npx hardhat run scripts/deploy_colored.js --network coloredChain

Loading test data:
- npx hardhat run scripts/setup_storage.js --network coloredChain

### 3. Running the Demo
In one terminal, start the middleware:
- npx hardhat run scripts/middleware.js --network topLayer

In a second terminal:
1) Login: node scripts/iam_login.js francesco 1234 (example)
2) Run simulation: npx hardhat run scripts/run_scenario.js --network topLayer

### 4. Advanced Scenario: Delegation Expiration
To test temporal delegation expiration:
- Ensure the middleware is running
- Run: npx hardhat run scripts/scenario_expiration.js --network topLayer

This scenario demonstrates:
- Granting a 10-second delegation
- Successful access verification within the time window
- EVM time manipulation to advance beyond expiration
- Failed access attempt after delegation expires

## Key Concepts
The execution of the Smart Contract on the Colored Chain (data retrieval) is contingent upon a positive output from the Smart Contract on the Top Layer.
The system implements granular security:

1. Entity Level (Smart Contract): Does the University have permission to access the data?
2. User Level (Keycloak): Is the specific person within the University authorized?
Only if both levels answer "Yes" is the data decrypted/returned.