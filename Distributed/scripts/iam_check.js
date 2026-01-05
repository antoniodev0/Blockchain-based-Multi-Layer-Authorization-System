const jwt = require('jsonwebtoken');

async function checkUser(token) {
    try {
        // 1. Decodifica il token senza verificare la firma (per velocità in locale)
        const decoded = jwt.decode(token);

        if (!decoded) {
            console.log("[IAM] Token non valido o corrotto.");
            return { authorized: false, role: "INVALID_TOKEN" };
        }

        // 2. Estrazione dati dal JSON che mi hai mostrato
        const username = decoded.preferred_username; // es: "francesco"
        
        // Safety check: controlliamo se esiste l'oggetto realm_access e l'array roles
        const roles = (decoded.realm_access && decoded.realm_access.roles) ? decoded.realm_access.roles : [];

        console.log(`   [IAM] Utente identificato: ${username}`);
        console.log(`   [IAM] Ruoli rilevati: [${roles.join(", ")}]`);

        // 3. LOGICA DI CONTROLLO (RBAC Reale)
        // Non importa se ti chiami Francesco o Maria. Importa se hai il ruolo.
        
        if (roles.includes("admin_documenti")) {
            // Successo!
            return { authorized: true, role: "ADMIN_DOCUMENTI" };
        } 
        else if (roles.includes("stagista")) {
            // Fallimento specifico per stagisti
            return { authorized: false, role: "STAGISTA" };
        } 
        else {
            // Fallimento generico
            return { authorized: false, role: "NESSUN_RUOLO_VALIDO" };
        }

    } catch (e) {
        console.error("Errore durante il controllo IAM:", e.message);
        return { authorized: false, role: "ERROR" };
    }
}

module.exports = { checkUser };