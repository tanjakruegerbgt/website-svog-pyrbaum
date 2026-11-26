# Hundesport Pyrbaum

Statische HTML-Version der Website Verein für dt. Schäferhunde Ortsgruppe Pyrbaum e. V.

Der Build erstellt die fertigen HTML-Dateien für den Webserver.

## Entwicklung und Veröffentlichung

Voraussetzung ist Node.js ab Version 18.17; zusätzliche npm-Pakete werden nicht
benötigt. `npm start` erstellt die Website und startet den lokalen
Entwicklungsserver unter `http://localhost:8080`. Mit der Umgebungsvariable
`PORT` lässt sich ein anderer Port wählen. Nach Änderungen an den Quelldateien
wird die Website neu erstellt und die geöffnete Seite automatisch aktualisiert.
Der Browser wird nicht automatisch geöffnet.

`npm run build` erstellt die veröffentlichungsfertige Website in `dist` und
ersetzt dabei dessen bisherigen Inhalt. `npm test` führt die Tests aus.
CSS und die 404-Seite werden dabei unverändert kopiert und nicht minifiziert.
Der Webserver muss Verzeichnis-URLs wie `/kontakt` auf die jeweilige
`index.html` auflösen und die Dateien im Ordner `dist` bereitstellen.
Für GitHub Pages setzt der Deployment-Workflow `SITE_BASE_PATH` automatisch,
damit Seiten- und Asset-Pfade auch unter dem Repository-Unterpfad funktionieren.

Die Startseite liegt in `index.html`, die Unterseiten liegen jeweils in einem
eigenen Verzeichnis. Die zugehörigen Stylesheets liegen neben den jeweiligen
HTML-Dateien, die Bilder in `images`. `css/base.css` enthält gemeinsame
Grund- und Header-Stile; die Stylesheets neben den Seiten enthalten deren
seitenspezifische Regeln. Gemeinsame Kopf- und Fußzeile, Logo und Footer-Stile
liegen in `layout` und werden beim Build in die Seiten eingesetzt.
Die HTML-Dateien im Projekt sind Vorlagen und müssen über `npm start` oder nach
`npm run build` aus `dist` bereitgestellt werden. Neue Meldungen werden direkt
im News-Bereich der Startseite ergänzt.

Das Kontaktformular öffnet das lokale E-Mail-Programm; die Nachricht wird erst
dort nach Bestätigung versendet. Es gibt keinen Formular-Backenddienst.
