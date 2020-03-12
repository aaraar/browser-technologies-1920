# Testing NS INFO op verschillende devices

## QP revolution
#### Mozilla/5.0 (Linux; Android 4.4.4; revolution Build/KTU84Q)AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome 33.0.0.0 Mobile Safari/537.35
WAFS: Geen Javascript dus alleen de header en footer laden
OBA: De pagina laad, maar zonder de javascript kan je er helemaal niks mee. Valt me op dat alle animaties (CSS) wel gewoon helemaal prima werken
#### Mozilla/5.0 (Linux; Android 4.4.4; revolution Build/KTU84Q)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.112 Chrome 33.0.0.0 Mobile Safari/537.35
WAFS: Met Javascript werkt de applicatie wel volledig en de snelheid is nog best okey. Zodra internet gethrottled wordt dan is het heeel langzaam.
OBA: De Webcam/camera gaat niet aan dus kan de functionaliteit niet verder dan inladen van de startstate

## Ipod Touch
#### Mozilla/5.0 (iPod; CPU iPhone OS 6_0_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A523 Safari/8536.25
WAFS: Javscript wordt niet uitgevoerd en de CSS ook niet helemaal. Een uitlijning in de header werkt niet
OBA: Werkt ook de webcam niet

WAFS: Om de app werkend te krijgen op andere devices moet het of SSR of static generated zijn. Ik ben bezig met mijn eigen static site generator, die grotendeels al overal HTML van maakt dus dan zou het moeten werken (zonder JS)
OBA: Waarschijnlijk moet ik extra code toevoegen om de camera werkend te krijgen op andere devices dan je computer. Dit is allemaal volledig JS dus op devices zonder JS kan dit waarschijnlijk helemaal niet

## Screenreader
WAFS: De app werkt best prima met screenreader, sommige onderdelen kunnen een iets duidelijker label hebben en er mist een uitleg wat de site nou eigenlijk doet, maar voorderest is het best duidelijk.
Belangrijk is vooral dat ik de tab volgorde of layout verbeter. Als ik namelijk met toetstenbord door de pagina ga, moet ik na het kiezen weer door de hele pagina heen voordat ik op submit kan klikken.

## features uitzetten op WAFS
#### 1. Afbeeldingen uitzetten
Alleen het laad icoon is een img (SVG) die wordt uitgeschakeld, ondanks dat in bespreking werd gezegd dat SVG's zichtbaar zouden blijven. Voorderest past het geen functionaliteit aan
#### 2. Custom fonts uitzetten
Ik gebruik gewoon de sans-serif font-familly dus er veranderd niks zonder Custom fonts
#### 3. Kleur uitzetten & kleurenblindheid instellen
Op zwartwit is er nog steeds heel veel contrast (geel, zwart)
In elke kleurenblindheidsmodus is net zoveel contrast zichtbaar en er worden geen kleuren gebruikt voor functionaliteit
#### 4. Muis/Trackpad werkt niet
Je kan overaal doorheen tabben, wat best okey werkt, het enige wat jammer is, is dat je door de hele lijst weer moet nadat je twee stations hebt geselecteerd voor een trip omdat de submit knop bovenin staat. Hiervoor zou ik de submit knop (ook) onderaan kunnen zetten of met Enter ook het formulier submitten
#### 5. Breedband internet uitzetten
De app wordt heeeeeel langzaam omdat het via een proxy naar de NS server gaat (ivm CORS errors). Als het vanaf een server gaat is het al een stuk sneller, maar het snelst zou zijn als ik statische HTML genereer (waar ik mee bezig ben)
#### 6. Javascript (volledig)
De app draait volledig op Javascript dus werkt niet zonder.
 Om de app werkend te krijgen op andere devices moet het of SSR of static generated zijn. Ik ben bezig met mijn eigen static site generator, die grotendeels al overal HTML van maakt dus dan zou het moeten werken (zonder JS)
#### 7. Cookies niet accepteren
De app draait vooral heel langzaam zonder cookies, aangezien er dingen in localStorage worden opgeslagen en als dit niet kan dan wordt het telkens uit de API gehaald.
De werking is wel nog steeds goed
#### 8. localStorage doet het niet
^
