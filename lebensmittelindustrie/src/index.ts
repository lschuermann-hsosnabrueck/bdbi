import { load } from 'ts-dotenv'
import { LogLevel, Nautilus } from '@deltadao/nautilus'
import { Network, NETWORK_CONFIGS, PRICING_CONFIGS } from './config'
import { Wallet, providers} from 'ethers'
import {publishAgriAlgoAsset, publishAgriProductAsset} from "./asset";
import {askQuestion} from "./ui"

const env = load({
    NETWORK: String,
    PRIVATE_KEY: String
})

if (!env.NETWORK) {
    throw new Error(
        `Set your networn in the .env file. Supported networks are ${Object.values(
            Network
        ).join(', ')}.`
    )
}
const selectedEnvNetwork = env.NETWORK.toUpperCase()
if (!(selectedEnvNetwork in Network)) {
    throw new Error(
        `Invalid network selection: ${selectedEnvNetwork}. Supported networks are ${Object.values(
            Network
        ).join(', ')}.`
    )
}

console.log(`Your selected NETWORK is ${Network[selectedEnvNetwork as Network]}`)
const networkConfig = NETWORK_CONFIGS[selectedEnvNetwork as Network]
const pricingConfig = PRICING_CONFIGS[selectedEnvNetwork as Network]

const privateKey = env.PRIVATE_KEY as string // make sure to setup your PRIVATE_KEY in .env file
const provider = new providers.JsonRpcProvider(networkConfig.nodeUri)
const wallet = new Wallet(privateKey, provider)



async function main(){
    Nautilus.setLogLevel(LogLevel.Verbose) // optional to show more nautilus internal logs
    const nautilus = await Nautilus.create(wallet, networkConfig)
    console.log("Willkommen! Was möchten Sie tun?");
    console.log("1: Publish Produkt-Asset");
    console.log("2: Publish Algo-Asset");
    console.log("0: Beenden");

    const choice = await askQuestion("Bitte wählen Sie eine Option (1, 2 oder 0): ");

    switch (choice) {
        case '1':
            await publishAgriProductAsset(nautilus, networkConfig, pricingConfig, wallet);
            break;
        case '2':
            await publishAgriAlgoAsset(nautilus, networkConfig, pricingConfig, wallet);
            break;
        case '0':
            console.log("Programm beendet.");
            return;
        default:
            console.log("Ungültige Auswahl. Bitte erneut versuchen.\n");
            break;
    }

    // Nach Abschluss zurück zum Menü
    await main();

}

main()