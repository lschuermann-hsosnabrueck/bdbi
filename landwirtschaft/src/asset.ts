import {
    AssetBuilder,
    ConsumerParameterBuilder,
    CredentialListTypes,
    FileTypes,
    Nautilus,
    ServiceBuilder,
    ServiceTypes,
    UrlFile,
} from "@deltadao/nautilus";
import {NetworkConfig} from "./config";
import {Wallet} from "ethers";
import {askQuestion} from "./ui";

export async function publishAgriProductAsset(
    nautilus: Nautilus,
    networkConfig: NetworkConfig,
    pricingConfig: any,
    wallet: Wallet
){
    console.log("Publish Agri-Produkt")
    const productName = await askQuestion("Produktname: ")
    const description = await askQuestion("Produktbeschreibung: ")
    const pricePerKg = Number(await askQuestion("Preis pro kg: "))
    const certificate = await askQuestion("Zertifikat (Bioland, Demeter, ...): ")
    const owner = await wallet.getAddress()

    const serviceBuilder = new ServiceBuilder({
        serviceType: ServiceTypes.COMPUTE,
        fileType: FileTypes.URL
    }) // compute type dataset with URL data source

    const urlFile: UrlFile = {
        type: 'url',
        url: 'https://raw.githubusercontent.com/lschuermann-hsosnabrueck/bdbi/refs/heads/main/landwirtschaft/assets/order.json',
        method: 'GET'
    }

    const service = serviceBuilder
        .setServiceEndpoint(networkConfig.providerUri)
        .setTimeout(600)
        .addFile(urlFile)
        .setPricing(pricingConfig.FREE)
        .setDatatokenNameAndSymbol('My Datatoken Name', 'SYMBOL') // important for following access token transactions in the explorer
        .addTrustedAlgorithmPublisher('0x103501f5db82F162ec6807d21A8D847ed4b77cAc')
        .addTrustedAlgorithmPublisher('0xb2D3015C7356Dfde2FFe3AaBf148460A03dc74A3') //Hinzufügen von accounts
        .addTrustedAlgorithms([{did: 'did:op:606ca1825958edbbfbd819fc8976df2bc4bcc0a737cac230233d65902f3e3c35'}]) // Hier entsprechendne Algorithmus angeben
        .build()

    const assetBuilder = new AssetBuilder()
    const asset = assetBuilder
        .setType('dataset')
        .setName(productName)
        .setDescription(description)
        .addAdditionalInformation({
            pricePerKg : pricePerKg,
            certificate : certificate
        })
        .setAuthor("HS Osnabrueck")
        .setLicense('MIT')
        .addService(service)
        .setOwner(owner)
        .addCredentialAddresses(CredentialListTypes.ALLOW, ['0x103501f5db82F162ec6807d21A8D847ed4b77cAc', '0xb2D3015C7356Dfde2FFe3AaBf148460A03dc74A3']) // hier Accounts hinzufügen, die Zugriff haben sollen
        .build()

    const result = await nautilus.publish(asset)
    console.log(result)
}

export async function publishAgriAlgoAsset(
    nautilus: Nautilus,
    networkConfig: NetworkConfig,
    pricingConfig: any,
    wallet: Wallet
){
    console.log("Publishing Agri-Algorithm");
    const owner = await wallet.getAddress()
    const serviceBuilder = new ServiceBuilder({
        serviceType: ServiceTypes.COMPUTE,
        fileType: FileTypes.URL
    })
    const urlFile: UrlFile = {
        type: 'url',
        url: 'https://raw.githubusercontent.com/lschuermann-hsosnabrueck/bdbi/refs/heads/main/landwirtschaft/assets/createOrder.js',
        method: 'GET'
    }

    const consumerParameterBuilder = new ConsumerParameterBuilder()

    const consumerParameter = consumerParameterBuilder
        .setType('number')
        .setName('quantity')
        .setLabel('Quantity')
        .setDescription('Order quantity (kg)')
        .setDefault('50')
        .setRequired(true)
        .build()

    const service = serviceBuilder
        .setServiceEndpoint(networkConfig.providerUri)
        .setTimeout(86400)
        .addFile(urlFile)
        .setPricing(pricingConfig.FREE)
        .addConsumerParameter(consumerParameter)
        .setDatatokenNameAndSymbol('My Datatoken Name', 'SYMBOL')
        .build()

    const algoMetadata = {
        language: 'Node.js',
        version: '1.0.0',
        container: {
            // https://hub.docker.com/layers/library/node/18.17.1/images/sha256-91e37377b960d0b15d3c15d15321084163bc8d950e14f77bbc84ab23cf3d6da7?context=explore
            entrypoint: 'node $ALGO',
            image: 'node',
            tag: '18.17.1',
            checksum:
                'sha256:91e37377b960d0b15d3c15d15321084163bc8d950e14f77bbc84ab23cf3d6da7'
        }
    }
    const assetBuilder = new AssetBuilder()

    const asset = assetBuilder
        .setType('algorithm')
        .setName('Create Order Algorithm')
        .setDescription('Algorithm to create order for product')
        .setAuthor('HS Osnabrueck')
        .setLicense('MIT')
        .setAlgorithm(algoMetadata)
        .addService(service)
        .addCredentialAddresses(CredentialListTypes.ALLOW, ['0x103501f5db82F162ec6807d21A8D847ed4b77cAc', '0xb2D3015C7356Dfde2FFe3AaBf148460A03dc74A3']) // hier Accounts hinzufügen, die Zugriff haben sollen
        .setOwner(owner)
        .build()

    const result = await nautilus.publish(asset)
    console.log(result)
}