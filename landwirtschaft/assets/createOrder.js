const fs = require('fs')
const path = require('path');

const inputFolder = "/data/inputs/";
const outputFolder = "/data/outputs/";
const ddoFolder = "/data/ddos/";

// Sicherstellen, dass die DIDS-Umgebungsvariable korrekt ist
let dids;
try {
    dids = JSON.parse(process.env.DIDS || "[]");
} catch (err) {
    console.error("Fehler beim Parsen der DIDS-Umgebungsvariable:", err);
    process.exit(1);
}

// Prüfen, ob ein DID existiert
if (!Array.isArray(dids) || dids.length === 0) {
    console.error("Keine gültigen DIDs gefunden.");
    process.exit(1);
}
const did = dids[0];
const outputFile = path.join(outputFolder, "results.json");
const serviceFilePath = path.join(ddoFolder, did);
const didHash = did.replace("did:op:", ""); // Entferne das "did:op:" Präfix
const inputFile = path.join(inputFolder, didHash, "0");

async function createOrder() {
    let productName = "Unbekannt";

    // Überprüfung: Existiert die `order.json`?
    if (!fs.existsSync(inputFile)) {
        console.error("order.json nicht gefunden oder leer:", inputFile);
        process.exit(1);
    }
    console.log("Order-JSON gefunden unter:", inputFile);

    if (fs.existsSync(serviceFilePath) && fs.statSync(serviceFilePath).size > 0) {
        try {
            const ddo = JSON.parse(fs.readFileSync(serviceFilePath, 'utf8'));
            //console.log("DDO Inhalt:", JSON.stringify(ddo, null, 2));
            if (ddo) {
                productName = ddo.metadata.name;
            }
        } catch (err) {
            console.error("Fehler beim Lesen der DDO-Datei:", err);
        }
    } else {
        console.warn("DDO-Datei existiert nicht oder ist leer:", serviceFilePath);
    }

    let order;
    try {
        order = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
        order.productName = productName;
    } catch (err) {
        console.error("Fehler beim Lesen der order.json:", err);
        process.exit(1);
    }

    // Ergebnis speichern
    try {
        fs.writeFileSync(outputFile, JSON.stringify(order, null, 2));
        console.log(`Ergebnis gespeichert: ${outputFile}`);
    } catch (err) {
        console.error("Fehler beim Schreiben der results.json:", err);
    }

}

async function runAlgorithm() {
    await createOrder()
}

runAlgorithm()