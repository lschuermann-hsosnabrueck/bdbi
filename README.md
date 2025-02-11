# BDBI-Projekt: Datenraum

Dieses Repository enthält drei TypeScript-Projekte, welche im Zusammenspiel prototypisch eine Food-Supply-Chain
anhand des Ponuts-X Datenraumes umsetzen.

Die Projekte haben alle einen ähnlichen Aufbau:
- index.ts als Einstiegspunkt
  - Enthält die UI für den User, um Daten zu Produkte zu veröffentlichen
  - Enthält die Erzeugung des Providers und des Wallets, um mit der Blockchain zu interagieren
- config.ts als Konfigurationsdatei für das Netzwerk
- asset.ts als Service
  - Enthält Services, um Assets zu veröffentlichen und zu konsumieren
  - Bietet auch die Möglichkeit, einen neuen Algorithmus zu veröffentlichen, falls gewünscht
- ui.ts als Hilfsfunktion 

Um das Projekt zu starten sind folgende Schritte notwendig:
1. Installation der node Module: `npm install`
2. Einrichten der .env Datei: `cp ./exmaple.env ./env`
3. Einfügen in die .env Datei
   4. ``NETWORK``: Das entsprechende Netzwerk (PONTUSDEV, PONTUSXTEST)
   5. ``PRIVATE_KEY``: Der eigene private Schlüssel des Wallets
6. Falls ein anderer Account genutzt wird, als der mit dem das Projekt erstellt wurde, müssen eventuell an verschiedenen
Stellen Anpassungen vorgenommen werden. Diese sind in den READMEs der Projekte und in Kommentaren im Code
weiter erklärt. Mit dem ursprünglichen Account ist das Projekt ohne weitere Anpassungen ausführbar.
   7. Für die beiden Accounts der HS Osnabrück sollte der Prototyp funktionieren.
7. Starten des Skripts: ``npm start``

Die Assets sind im assets-Ordner des jeweiligen Projtes zu finden. Für dieses Projekt müssen diese an einem
für das Pontus-X Netzwerk öffentlich erreichbaren Ort sein (also z.B dieses öffentliche GitHub Repo).
Dies muss beachtet werden, wenn man an den assets Änderungen vornehmen möchte, dann muss man entsprechend
die Links angepasst auf das eigene Repository anpassen