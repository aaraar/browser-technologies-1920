# Progressive enhanced case
## Usecase
Ik wil een enquete kunnen invullen over de minor Web Development, met verschillende antwoord mogelijkheden. Als ik de enquete niet afkrijg, wil ik later weer verder gaan met waar ik ben gebleven.

## Idee
- Een enquete die per stap/vraag een eigen pagina heeft. Op het moment dat je begint maakt de server een hash aan die je kan kopieren/onthouden zodat je later altijd terug kan
- Een progress bar per pagina laat zien hoe ver je bent.
- Met JS wordt het een SPA die je makkelijk heen en weer laat gaan en local storage gebruikt zodat je de hash niet hoeft te onthouden

## Wireflow
### Functional
![functional](./images/functional.jpg)
- Voeg toe dat je link kan kopieëren ipv alleen de code onthouden

### Usable
![usable](./images/usable.jpg)
- grotendeels CSS

### Pleasurable toevoegingen
![pleasurable](./images/pleasurable.jpg)
- Form validatie in JS wanneer mogelijk
- Server side formulier validatie is Nice to have, dus niet verplicht (PPK approves)
- Misschien autosubmit on revisit d.m.v. JS/serviceworker (PPK approves)