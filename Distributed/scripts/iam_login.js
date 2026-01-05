const axios = require('axios');
const qs = require('qs'); // Serve per formattare i dati per Keycloak
const fs = require('fs');

async function login(username, password) {
    const data = qs.stringify({
        'client_id': 'blockchain-app',
        'grant_type': 'password', // Login diretto da terminale
        'username': username,
        'password': password
    });

    try {
        console.log(`Tentativo di login su Keycloak per: ${username}...`);
        
        // Chiamata all'endpoint ufficiale di Keycloak per ottenere il token
        const response = await axios.post(
            'http://localhost:8080/realms/unime-realm/protocol/openid-connect/token',
            data,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = response.data.access_token;
        console.log("✅ Login riuscito! Token JWT ricevuto.");
        
        // Salviamo il token su file per farlo leggere al middleware
        fs.writeFileSync("user_token.jwt", accessToken);
        console.log("💾 Token salvato in 'user_token.jwt'");

    } catch (error) {
        console.error("Errore Login:", error.response ? error.response.data : error.message);
    }
}

// Prende argomenti da terminale: node login_keycloak.js 
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Uso: node scripts/login_keycloak.js <username> <password>");
} else {
    login(args[0], args[1]);
}