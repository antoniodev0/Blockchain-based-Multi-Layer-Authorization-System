const jwt = require('jsonwebtoken');

async function checkUser(token) {
    try {
        // 1. Decode the token without verifying the signature (for local speed)
        const decoded = jwt.decode(token);

        if (!decoded) {
            console.log("[IAM] Token non valido o corrotto.");
            return { authorized: false, role: "INVALID_TOKEN" };
        }

        // 2. Extract data from the JSON
        const username = decoded.preferred_username; // e.g.: "francesco"
        
        // Safety check: verify if the realm_access object and roles array exist
        const roles = (decoded.realm_access && decoded.realm_access.roles) ? decoded.realm_access.roles : [];

        console.log(`   [IAM] Utente identificato: ${username}`);
        console.log(`   [IAM] Ruoli rilevati: [${roles.join(", ")}]`);

        // 3. CONTROL LOGIC (Real RBAC)
        // It doesn't matter if your name is Francesco or Maria. What matters is if you have the role.
        
        if (roles.includes("admin_documenti")) {
            // Success!
            return { authorized: true, role: "ADMIN_DOCUMENTI" };
        } 
        else if (roles.includes("stagista")) {
            // Specific failure for interns
            return { authorized: false, role: "STAGISTA" };
        } 
        else {
            // Generic failure
            return { authorized: false, role: "NESSUN_RUOLO_VALIDO" };
        }

    } catch (e) {
        console.error("Errore durante il controllo IAM:", e.message);
        return { authorized: false, role: "ERROR" };
    }
}

module.exports = { checkUser };