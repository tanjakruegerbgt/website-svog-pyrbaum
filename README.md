# Hundesport Pyrbaum

Statische HTML-Version der Website aus dem Astro-Projekt. Die Seiten sind
unabhängig von Astro und können direkt mit einem Webserver bereitgestellt werden.

## Entwicklung und Veröffentlichung

Nach `npm install` startet `npm start` den lokalen Entwicklungsserver.
`npm run build` erstellt die veröffentlichungsfertige Website in `dist`.
Der Webserver muss Verzeichnis-URLs wie `/kontakt` auf die jeweilige
`index.html` auflösen und die Dateien im Ordner `dist` bereitstellen.

Die Startseite liegt in `index.html`, die Unterseiten liegen jeweils in einem
eigenen Verzeichnis. Die zugehörigen Stylesheets liegen neben den jeweiligen
HTML-Dateien, die Bilder in `images`. Die Dateien wurden aus der statischen Astro-Ausgabe
übernommen und können hier unabhängig bearbeitet werden. Neue Meldungen werden
direkt im News-Bereich der Startseite ergänzt.

Das Kontaktformular öffnet das lokale E-Mail-Programm; die Nachricht wird erst
dort nach Bestätigung versendet. Es gibt keinen Formular-Backenddienst.
