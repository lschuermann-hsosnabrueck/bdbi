# BDBI-Projekt: Datenraum (Lebensmittelindustrie)

Der Projektaufbau wird in der README im root-Verzeichnis dieses Repos erläutert.

Über die Konsole kann nach npms start ein neues Lebensmittelprodukt im Pontus-X Datenraum veröffentlicht werden.
Bei der Erstellung muss die DID des Agri-Produktes angegeben werden.

In [asset.ts](src/asset.ts) können in Zeile 112 und 179 Accounts hinzugefügt werden, die Zugriff auf die Assets haben sollen.
Dort die öffentliche Adresse einfügen.
Ebenfalls in Zeile 92 muss die did des Algorithmus angepasst werden, falls ein anderer genutzt werden soll.
In Zeile 20 muss die did des Algos angegeben werden, der zur Erstellung der Order genutzt werden soll.
