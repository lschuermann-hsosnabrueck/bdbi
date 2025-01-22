import { load } from 'ts-dotenv'
import { LogLevel, Nautilus } from '@deltadao/nautilus'
import { Network, NETWORK_CONFIGS, PRICING_CONFIGS } from './config'
import { Wallet, providers} from 'ethers'

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
    const asset = await nautilus.getAquariusAsset("did:op:18bce08da1adaf545be512d9592b4175c29e2136ec60c10d472fb3860fecf60e")
    console.log('Name of asset: ', asset.metadata.name)
}

main()