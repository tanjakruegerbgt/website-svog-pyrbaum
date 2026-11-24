# Vereinswebsite für Hundesport Pyrbaum (Verein für dt. Schäferhunde der Ortsgruppe Pyrbaum e. V.)

Statische HTML-Version der Website. Die komplette Website liegt größtenteils als eine einzige `index.html` vor und kann direkt mit einem Webserver bereitgestellt werden.

## Bewusst einfache Umsetzung

Das Projekt wurde gezielt einfach und schlank gehalten. Ziel war es, eine übersichtliche, funktionale und pflegeleichte Website ohne unnötige technische Komplexität zu erstellen.

Auf ein umfangreiches Framework, ein Content-Management-System oder eine separate Backend-Infrastruktur wurde bewusst verzichtet. Stattdessen kommen einfache Webtechnologien zum Einsatz. Dadurch bleibt das Projekt leicht verständlich, schnell ladbar und unkompliziert zu warten.

Die reduzierte Architektur ist eine bewusste Entscheidung und keine technische Einschränkung. Änderungen und Ergänzungen können direkt an den vorhandenen Dateien vorgenommen werden, ohne zusätzliche Abhängigkeiten oder komplexe Entwicklungsprozesse.

## Entwicklung und Veröffentlichung

Nach `npm install` startet `npm start` den lokalen Entwicklungsserver. `npm run build` erstellt die veröffentlichungsfertige Website in `dist`. Der Webserver muss die Dateien im Ordner `dist` bereitstellen.

Alle Bereiche (Sportarten, Kontakt, Impressum und Datenschutz) sind als Abschnitte in `index.html` enthalten und über Anker erreichbar. Die Styles sind direkt in die HTML-Datei eingebettet, Bilder liegen weiterhin in `images`. Neue Meldungen werden direkt im News-Bereich ergänzt.

Das Kontaktformular öffnet das lokale E-Mail-Programm; die Nachricht wird erst dort nach Bestätigung versendet. Es gibt keinen Formular-Backenddienst.
