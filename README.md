# Forbici Pizza — sito web

Forbici Pizza è un sito web statico per una pizzeria in teglia nel centro
storico di Padova. Il progetto racconta l’identità del locale, presenta il
menu e accompagna i visitatori verso la prenotazione, l’asporto e i servizi di
consegna esterni.

## Identità e contenuti

Il restyling prende spunto dalle fotografie del locale in Via San Francesco,
28: legno, pannelli scuri, piatti decorati e dettagli verdi. La palette
combina carbone, crema e verde salvia, con bottoni color noce ispirati al legno
degli arredi. Titoli serif,
fotografie ampie e sezioni editoriali accompagnano il visitatore dal banco
alla scelta del menu e alla prenotazione.

Il carosello del menu si integra nello sfondo crema con un pannello salvia
chiaro, fotografie dagli angoli morbidi, titoli grandi e indicatori cliccabili.
Si naviga con i pulsanti, la tastiera o lo scorrimento orizzontale.
La homepage usa un’apertura crema continua con la navigazione, una foto ampia
con un fondale salvia e un titolo compatto. Su mobile la foto precede testo e
azioni, per mostrare subito il prodotto. I contatti e la pagina allergeni
condividono la stessa identità.
Le freccette decorative diagonali sono state rimosse; restano i comandi
funzionali del carosello.

Foto della sala e dell’ingresso e note sui riferimenti visivi sono documentate
in [`assets/SOURCES.md`](assets/SOURCES.md). Le immagini sono salvate localmente,
senza richieste a siti esterni durante il caricamento delle pagine.

Le pagine principali sono:

- `index.html`: homepage con presentazione del locale, prodotti in evidenza,
  indirizzo e collegamenti alle azioni principali.
- `menu.html`: menu organizzato per categorie, con carosello introduttivo,
  filtri e informazioni sui prodotti.
- `allergeni.html`: pagina informativa con le 14 categorie di allergeni
  previste dalla normativa europea.
- `contatti.html`: informazioni sul locale, indirizzo, telefono, prenotazione,
  consegna, asporto e mappa caricata su richiesta.

## Struttura tecnica

Il progetto utilizza HTML semantico, CSS condiviso e JavaScript nativo, senza
framework o dipendenze esterne. Il layout è responsive e comprende una
versione mobile della navigazione, controlli accessibili, supporto alla
navigazione da tastiera e rispetto delle preferenze di riduzione delle
animazioni.

- `styles.css` definisce colori, tipografia, griglie, componenti, breakpoint e
  comportamento responsive.
- `script.js` gestisce la navigazione mobile, la finestra per gli ordini, i
  filtri del menu, il carosello delle categorie e il caricamento esplicito
  della mappa.
- `assets/` contiene le fotografie dei prodotti e del locale, favicon e fonti del restyling.

## Servizi collegati

Il sito indirizza verso servizi esterni per prenotazioni e consegne:

- indirizzo: Via San Francesco, 28, Padova;
- telefono: +39 049 956 6127;
- prenotazione tramite Google e Quandoo;
- consegna tramite Glovo e Deliveroo;
- profilo Instagram del locale.

Il sito non gestisce direttamente prenotazioni, pagamenti o ordini: queste
azioni avvengono sulle piattaforme collegate.

## Ambito del progetto

Il menu e i prezzi rappresentano una selezione editoriale delle proposte del
locale e possono variare. Le descrizioni dei prodotti non sostituiscono la
verifica degli ingredienti, degli allergeni o delle possibili contaminazioni
incrociate; per esigenze specifiche è necessario chiedere conferma al
personale.

## Verifica locale

Non serve una compilazione. Apri `index.html` oppure avvia un server statico:

```sh
python3 -m http.server 8000
```

Visita `http://localhost:8000`. Controlla le quattro pagine su desktop e mobile,
la navigazione, i filtri, il carosello, la finestra degli ordini e il caricamento
della mappa su richiesta. Per la sintassi JavaScript: `node --check script.js`.

La palette delle superfici alterna crema, sabbia e salvia chiarissimo. Le
sezioni dedicate a prenotazione e consegna usano un fondo salvia leggero;
il piè di pagina condiviso usa salvia polveroso con testo scuro, per una
chiusura più morbida su tutte le pagine.
