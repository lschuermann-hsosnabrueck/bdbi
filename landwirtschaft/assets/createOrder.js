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
const algoCustomDataFile = path.join(inputFolder, 'algoCustomData.json');

async function createOrder() {

    if (!fs.existsSync(inputFile) || !fs.existsSync(serviceFilePath) || !fs.existsSync(algoCustomDataFile)) {
        console.error("Eine der Dateien nicht nicht gefunden:", inputFile, serviceFilePath, algoCustomDataFile);
        process.exit(1);
    }

    let order;
    let algoCustomData;
    let ddo;
    try {
        order = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
        ddo = JSON.parse(fs.readFileSync(serviceFilePath, 'utf8'))
        //console.log("DDO Inhalt:", JSON.stringify(ddo, null, 2));
        algoCustomData = JSON.parse(fs.readFileSync(algoCustomDataFile, 'utf8'))
        //console.log("CustomData Inhalt:", JSON.stringify(algoCustomData, null, 2));
    } catch (err) {
        console.error("Fehler beim Lesen:", err);
        process.exit(1);
    }

    const date = new Date().toISOString()
    order.orderId = 'AP-' + date
    order.date = date
    order.origin.country = 'GER'
    order.origin.grower = 'HS Osnabrueck'
    order.productName = ddo.metadata.name
    order.pricePerKg = ddo.metadata.additionalInformation.pricePerKg
    order.certificate = ddo.metadata.additionalInformation.certificate
    order.quantity = algoCustomData.quantity
    order.totalPrice = order.quantity * Number(order.pricePerKg)

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