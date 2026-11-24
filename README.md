# Hundesport Pyrbaum

Statische HTML-Version der Website aus dem Astro-Projekt. Die komplette
Website liegt als eine einzige `index.html` vor und kann direkt mit einem
Webserver bereitgestellt werden.

## Entwicklung und Veröffentlichung

Nach `npm install` startet `npm start` den lokalen Entwicklungsserver.
`npm run build` erstellt die veröffentlichungsfertige Website in `dist`.
Der Webserver muss die Dateien im Ordner `dist` bereitstellen.

Alle Bereiche (Sportarten, Kontakt, Impressum und Datenschutz) sind als
Abschnitte in `index.html` enthalten und über Anker erreichbar. Die Styles
sind direkt in die HTML-Datei eingebettet, Bilder liegen weiterhin in
`images`. Neue Meldungen werden direkt im News-Bereich ergänzt.

Das Kontaktformular öffnet das lokale E-Mail-Programm; die Nachricht wird erst
dort nach Bestätigung versendet. Es gibt keinen Formular-Backenddienst.
