# Hundesport Pyrbaum

Statische HTML-Version der Website aus dem Astro-Projekt. Die Seiten sind
unabhängig von Astro; der Build erstellt die fertigen HTML-Dateien für den Webserver.

## Entwicklung und Veröffentlichung

Nach `npm install` startet `npm start` den lokalen Entwicklungsserver.
`npm run build` erstellt die veröffentlichungsfertige Website in `dist`.
Der Webserver muss Verzeichnis-URLs wie `/kontakt` auf die jeweilige
`index.html` auflösen und die Dateien im Ordner `dist` bereitstellen.

Die Startseite liegt in `index.html`, die Unterseiten liegen jeweils in einem
eigenen Verzeichnis. Die zugehörigen Stylesheets liegen neben den jeweiligen
HTML-Dateien, die Bilder in `images`. Gemeinsame Kopf- und Fußzeile, Logo und
Footer-Stile liegen in `layout` und werden beim Build in die Seiten eingesetzt.
Die HTML-Dateien im Projekt sind Vorlagen und müssen über `npm start` oder nach
`npm run build` aus `dist` bereitgestellt werden. Neue Meldungen werden direkt
im News-Bereich der Startseite ergänzt.

Das Kontaktformular öffnet das lokale E-Mail-Programm; die Nachricht wird erst
dort nach Bestätigung versendet. Es gibt keinen Formular-Backenddienst.
