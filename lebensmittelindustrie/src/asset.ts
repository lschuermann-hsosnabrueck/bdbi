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

export async function compute(nautilus: Nautilus, datasetDid: string, quantity:number){
    const dataset = {
        did: datasetDid
    }
    const algorithm = {
        did: 'did:op:a484ceae2002d5e2237e2f81de8f0d151e3610b39dfc6070d8f2792a10409ca8',
        algocustomdata: {
            quantity: quantity
        }
    }
    const computeConfig = {
        dataset,
        algorithm
    }

    const computeJob = await nautilus.compute(computeConfig)
    console.log('COMPUTE JOB: ', computeJob)
    return Array.isArray(computeJob) ? computeJob[0] : computeJob
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function publishAgriProductAsset(
    nautilus: Nautilus,
    networkConfig: NetworkConfig,
    pricingConfig: any,
    wallet: Wallet
){
    console.log("Publish Produkt")
    const productName = await askQuestion("Produktname: ")
    const description = await askQuestion("Produktbeschreibung: ")
    const pricePerUnit = Number(await askQuestion("Preis pro Einheit: "))
    const agriDid= await askQuestion("DID des Agri-Produkts: ")
    const agriQuantity = Number(await askQuestion("Menge des Agri-Produkt: "))
    const owner = await wallet.getAddress()

    const computeJob = await compute(nautilus, agriDid, agriQuantity)

    const computeConfig = {
        jobId: computeJob.jobId,
        providerUri: networkConfig.providerUri
    }

    let status = 1
    while (status != 70){
        await sleep(10000)
        let jobStatus = await nautilus.getComputeStatus(computeConfig)
        status = jobStatus.status
        console.log(status)
    }

    let resultUrl = await nautilus.getComputeResult(computeConfig)

    const data = resultUrl && await fetch(resultUrl)
    const order = await data.json()
    //console.log(await data.json())

    const serviceBuilder = new ServiceBuilder({
        serviceType: ServiceTypes.COMPUTE,
        fileType: FileTypes.URL
    }) // compute type dataset with URL data source

    const urlFile: UrlFile = {
        type: 'url',
        url: 'https://raw.githubusercontent.com/lschuermann-hsosnabrueck/bdbi/refs/heads/landwirtschaft-industrie/lebensmittelindustrie/assets/order.json',
        method: 'GET'
    }

    const service = serviceBuilder
        .setServiceEndpoint(networkConfig.providerUri)
        .setTimeout(600)
        .addFile(urlFile)
        .setPricing(pricingConfig.FREE)
        .setDatatokenNameAndSymbol('My Datatoken Name', 'SYMBOL') // important for following access token transactions in the explorer
        .addTrustedAlgorithmPublisher('0x103501f5db82F162ec6807d21A8D847ed4b77cAc')
        .addTrustedAlgorithms([{did: 'did:op:a0bceaf9df363ed6effd047326789246b4dcb823f6e84092d78a881498d662de'}]) // algorithm to create order
        .build()

    const assetBuilder = new AssetBuilder()
    const asset = assetBuilder
        .setType('dataset')
        .setName(productName)
        .setDescription(description)
        .addAdditionalInformation({
            pricePerUnit : pricePerUnit,
            agriDid : agriDid,
            jobId: computeJob.jobId,
            agreementId: computeJob.agreementId,
            agriOrigin : order.origin,
            agriCertificate: order.certificate
        })
        .setAuthor("HS Osnabrueck")
        .setLicense('MIT')
        .addService(service)
        .setOwner(owner)
        .addCredentialAddresses(CredentialListTypes.ALLOW, ['0x103501f5db82F162ec6807d21A8D847ed4b77cAc'])
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
    console.log("Publishing Product-Algorithm");
    const owner = await wallet.getAddress()
    const serviceBuilder = new ServiceBuilder({
        serviceType: ServiceTypes.COMPUTE,
        fileType: FileTypes.URL
    })
    const urlFile: UrlFile = {
        type: 'url',
        url: 'https://raw.githubusercontent.com/lschuermann-hsosnabrueck/bdbi/refs/heads/landwirtschaft-industrie/lebensmittelindustrie/assets/createOrder.js',
        method: 'GET'
    }

    const consumerParameterBuilder = new ConsumerParameterBuilder()

    const consumerParameter = consumerParameterBuilder
        .setType('number')
        .setName('quantity')
        .setLabel('Quantity')
        .setDescription('Order quantity')
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
        .setName('Create LP-Order Algorithm')
        .setDescription('Algorithm to create order for food product')
        .setAuthor('HS Osnabrueck')
        .setLicense('MIT')
        .setAlgorithm(algoMetadata)
        .addService(service)
        .addCredentialAddresses(CredentialListTypes.ALLOW, ['0x103501f5db82F162ec6807d21A8D847ed4b77cAc'])
        .setOwner(owner)
        .build()

    const result = await nautilus.publish(asset)
    console.log(result)
}