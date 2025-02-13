import {Nautilus,} from "@deltadao/nautilus";
import {NetworkConfig} from "./config";
import {askQuestion} from "./ui";
import {promises as fs} from "fs";
import * as path from "path";

export async function computeAndPrint(
  nautilus: Nautilus,
  networkConfig: NetworkConfig
) {
  console.log("Consume Product");
  const did = await askQuestion("DID des Produkts: ");
  const quantity = Number(await askQuestion("Menge des Produkts: "));

  const computeJob = await compute(nautilus, did, quantity);

  const computeConfig = {
    jobId: computeJob.jobId,
    providerUri: networkConfig.providerUri,
  };

  let status = 1;
  while (status !== 70) {
    await sleep(10000);
    let jobStatus = await nautilus.getComputeStatus(computeConfig);
    status = jobStatus.status;
    console.log("Compute-Status:", status);
  }

  let resultUrl = await nautilus.getComputeResult(computeConfig);
  if (!resultUrl) {
    console.log("Kein Ergebnis verfügbar.");
    return;
  }

  console.log("Compute-Ergebnis abrufbar unter:", resultUrl);

  try {
    const response = await fetch(resultUrl);
    const data = await response.json();
    await fs.writeFile(path.join(process.cwd(), "orders", "order.json"), JSON.stringify(data, null, 2), "utf8");
    console.log("Compute-Ergebnis:", data);
  } catch (error) {
    console.error("Fehler beim Abrufen des Compute-Ergebnisses:", error);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function compute(
  nautilus: Nautilus,
  datasetDid: string,
  quantity: number
) {
  const dataset = {
    did: datasetDid,
  };

  // Hier DID anpassen, falls ein anderer genommen werden soll
  const algorithm = {
    did: "did:op:6668b23f3b8f30985451d3cd3f10b145958a4c9f846eae46ecdc738101bc7b2c",
    algocustomdata: {
      quantity: quantity,
    },
  };

  const computeConfig = {
    dataset,
    algorithm,
  };

  const computeJob = await nautilus.compute(computeConfig);
  console.log("Compute-Job gestartet:", computeJob);
  return Array.isArray(computeJob) ? computeJob[0] : computeJob;
}
