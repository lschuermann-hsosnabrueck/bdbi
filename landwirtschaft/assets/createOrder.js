const fs = require('fs')

const inputFolder = "/data/inputs/"
const outputFolder = "/data/outputs/"
const ddoFolder = "/data/ddos/"
const did = JSON.parse(process.env.DIDS[0])


async function createOrder(inputFolder) {
    const serviceFilePath = ddoFolder + did
    const inputFile = inputFolder + did + "0" + "order.json"
    let productName = ""
    if (!fs.existsSync(inputFile)) {
        console.error("order.json nicht gefunden:", inputFile);
        process.exit(1);
    }
    console.log("Order-JSON gefunden unter:", inputFile);
    if (fs.existsSync(serviceFilePath)) {
        const ddo = JSON.parse(fs.readFileSync(serviceFilePath, 'utf8'))
        for (const service of ddo.service) {
            if (service.type === 'metadata') {
                productName = service.attributes.main.name || "Unbekannt"
            }
        }
    }
    let order = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
    order.productName = productName;
    try {
        fs.writeFileSync(`${outputFolder}/results.json`, JSON.stringify(order, null, 2));
        console.log(`Written results to ${outputFolder}/results.json`)
    } catch (err) {
        console.error(err)
    }
}

async function runAlgorithm() {
    await createOrder(inputFolder)
}

runAlgorithm()