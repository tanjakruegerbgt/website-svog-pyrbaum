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

Die Startseite liegt in `index.html`, die Unterseiten liegen jeweils in einem
eigenen Verzeichnis. News werden in `news.json` gepflegt; jede Meldung hat
Titel, Datum, Ort, optional ein Bild und Textblöcke. Textblöcke können
`paragraph`, `heading` oder `list` sein. Bilder müssen unter `images` liegen
und mit `/images/...` referenziert werden. Beim Build werden die Meldungen
automatisch in den News-Bereich der Startseite eingesetzt. Die Reihenfolge in
der Datei ist die Anzeigereihenfolge; neue Beiträge kommen üblicherweise oben
in die Liste.

Füge einen neuen Beitrag als Objekt innerhalb der vorhandenen eckigen
Klammern ein; trenne mehrere Beiträge durch Kommas:

```json
{
  "id": "sommerfest-2027",
  "title": "Sommerfest in Pyrbaum",
  "date": "2027-07-10",
  "dateText": "10. Juli 2027",
  "location": "Pyrbaum",
  "image": null,
  "body": [
    { "type": "paragraph", "text": "Wir laden herzlich zu unserem Sommerfest ein." }
  ]
}
```

Jede `id` muss eindeutig und kleingeschrieben sein; für ein Bild zusätzlich
`imageAlt` mit einer Bildbeschreibung angeben. Für Aufzählungen kann ein
Textblock mit `"type": "list"` und `"items": ["Eintrag 1", "Eintrag 2"]`
verwendet werden.

## Termine pflegen

Öffentliche Termine stehen in `termine.json`. Im Objekt `training` bezeichnet
`weekday` den Wochentag (0 = Sonntag bis 6 = Samstag). Trainingsausfälle
werden als Datum im Format `YYYY-MM-DD` in `exceptions` eingetragen, z. B.
`"exceptions": ["2026-12-23"]`. Die Daten müssen auf den Trainingstag fallen.
Vergangene Ausfälle werden nicht mehr angezeigt.

Einzelne Veranstaltungen werden unter `events` eingetragen:

```json
{
  "title": "Sommerfest",
  "date": "2027-07-10",
  "details": "Beginn: 15:00 Uhr",
  "location": "Trainingsplatz Pyrbaum"
}
```

Nach Änderungen muss die Website neu gebaut und veröffentlicht werden.
Beim Seitenaufruf werden Termine anhand des aktuellen Datums in der Zeitzone
Europa/Berlin sortiert; Veranstaltungen bleiben einschließlich ihres
Termintags sichtbar. Das Training erscheint einmal mit dem nächsten Termin,
ausgenommen eingetragene Ausfälle. Auf der Startseite erscheinen höchstens
drei Einträge. Ohne JavaScript werden alle eingetragenen Termine einschließlich
vergangener Termine angezeigt. Nur öffentliche Termine in der Datei speichern.

Die zugehörigen Stylesheets liegen neben den jeweiligen HTML-Dateien, die
Bilder in `images`. `css/base.css` enthält gemeinsame Grund- und Header-Stile;
die Stylesheets neben den Seiten enthalten deren seitenspezifische Regeln.
Gemeinsame Kopf- und Fußzeile, Logo und Footer-Stile liegen in `layout` und
werden beim Build in die Seiten eingesetzt. Die HTML-Dateien im Projekt sind
Vorlagen und müssen über `npm start` oder nach `npm run build` aus `dist`
bereitgestellt werden.

Das Kontaktformular öffnet das lokale E-Mail-Programm; die Nachricht wird erst
dort nach Bestätigung versendet. Es gibt keinen Formular-Backenddienst.

## Dev-Deployment

Über **Actions → Deploy Branch to Dev Pages → Run workflow** kann im
Branch-Auswahlmenü ein beliebiger Branch manuell ausgewählt und auf der
separaten Entwicklungsumgebung
https://tanjakruegerbgt.github.io/website-svog-pyrbaum-dev/ veröffentlicht werden.
Der Workflow checkt genau den ausgewählten Branch aus und baut ihn mit dem Basispfad
`/website-svog-pyrbaum-dev` und überschreibt den Branch `gh-pages` des
Dev-Repositories.

Für das Deployment benötigt das produktive Repository das Actions-Secret
`DEV_DEPLOY_TOKEN`. Das Personal Access Token oder ein Fine-grained Token muss
Inhalt des Dev-Repositories lesen und in den Branch `gh-pages` schreiben dürfen.
Im Dev-Repository muss GitHub Pages für den Branch `gh-pages` des Repository-Roots
aktiviert sein.
