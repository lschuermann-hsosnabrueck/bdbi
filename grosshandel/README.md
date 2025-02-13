# BDBI-Projekt: Datenraum (Lebensmittelindustrie)

Der Projektaufbau wird in der README im root-Verzeichnis dieses Repos erläutert.

Über die Konsole kann nach ``npm start`` ein Lebensmittelprodukt im Pontus-X Datenraum bestellt werden.
Bei der Erstellung muss die DID des Lebensmittel-Produktes angegeben werden.
Das Ergebnis wird in der Datei ``/orders/order.json`` gespeichert und auf der Konsole ausgegeben.

In [asset.ts](src/asset.ts) kann in Zeile 62 die DID eines anderen Algos angegeben werden, falls gewünscht.