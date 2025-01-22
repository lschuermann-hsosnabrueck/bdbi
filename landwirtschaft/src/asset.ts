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
    const owner = await wallet.getAddress()
    const consumerParameterBuilder = new ConsumerParameterBuilder()

    const consumerParameter = consumerParameterBuilder
        .setType('number')
        .setName('quantity')
        .setLabel('Quantity')
        .setDescription('Order quantity (kg)')
        .setDefault('50')
        .setRequired(true)
        .build()

    const serviceBuilder = new ServiceBuilder({
        serviceType: ServiceTypes.COMPUTE,
        fileType: FileTypes.URL
    }) // compute type dataset with URL data source

    const urlFile: UrlFile = {
        type: 'url',
        url: 'https://raw.githubusercontent.com/lschuermann-hsosnabrueck/bdbi/refs/heads/landwirtschaft-industrie/landwirtschaft/assets/order.json',
        method: 'GET'
    }

    const service = serviceBuilder
        .setServiceEndpoint(networkConfig.providerUri)
        .setTimeout(600)
        .addFile(urlFile)
        .setPricing(pricingConfig.FREE)
        .setDatatokenNameAndSymbol('My Datatoken Name', 'SYMBOL') // important for following access token transactions in the explorer
        .addConsumerParameter(consumerParameter)
        .addTrustedAlgorithmPublisher('0x103501f5db82F162ec6807d21A8D847ed4b77cAc')
        .addTrustedAlgorithms([{did: 'did:op:93bbcf464d5e09d4a7fcfe18eac9674d15ec9a97c2afda22d0f4858253e95280'}]) // algorithm to create order
        .build()

    const assetBuilder = new AssetBuilder()
    const asset = assetBuilder
        .setType('dataset')
        .setName(productName)
        .setDescription(description)
        .setAuthor("HS Osnabrueck")
        .setLicense('MIT')
        .addService(service)
        .setOwner(owner)
        .addCredentialAddresses(CredentialListTypes.ALLOW, ['0x103501f5db82F162ec6807d21A8D847ed4b77cAc'])
        .build()

    const result = await nautilus.publish(asset)
    console.log(result)
}

export async function editAgriProductAsset(
    nautilus: Nautilus,
    networkConfig: NetworkConfig,
    pricingConfig: any,
    wallet: Wallet
){
    console.log("Edit Agri-Produkt");

}