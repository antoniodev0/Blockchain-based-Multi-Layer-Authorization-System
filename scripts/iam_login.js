const axios = require('axios');
const qs = require('qs'); // Used to format data for Keycloak
const fs = require('fs');

async function login(username, password) {
    const data = qs.stringify({
        'client_id': 'blockchain-app',
        'grant_type': 'password', // Direct login from terminal
        'username': username,
        'password': password
    });

    try {
        console.log(`Tentativo di login su Keycloak per: ${username}...`);
        
        // Call to the official Keycloak endpoint to obtain the token
        const response = await axios.post(
            'http://localhost:8080/realms/unime-realm/protocol/openid-connect/token',
            data,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = response.data.access_token;
        console.log("Login riuscito! Token JWT ricevuto.");
        
        // Save the token to file so the middleware can read it
        fs.writeFileSync("user_token.jwt", accessToken);
        console.log(" Token salvato in 'user_token.jwt'");

    } catch (error) {
        console.error("Errore Login:", error.response ? error.response.data : error.message);
    }
}

// Takes arguments from terminal: node login_keycloak.js 
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Uso: node scripts/login_keycloak.js <username> <password>");
} else {
    login(args[0], args[1]);
}