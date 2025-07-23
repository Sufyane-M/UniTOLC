# Requirements Document

## Introduction

La navbar responsive per UniTOLC è un componente di navigazione dinamico che si adatta al stato di autenticazione dell'utente e alle diverse dimensioni dello schermo. La navbar implementa un design glassmorphism e fornisce accesso rapido alle funzionalità principali dell'applicazione attraverso un'interfaccia intuitiva e moderna.

## Requirements

### Requirement 1

**User Story:** Come utente non autenticato, voglio vedere una navbar con informazioni di base e opzioni di accesso, così da poter navigare nel sito e accedere al mio account.

#### Acceptance Criteria

1. WHEN l'utente non è autenticato THEN la navbar SHALL mostrare il logo "UniTOLC" a sinistra
2. WHEN l'utente non è autenticato THEN la navbar SHALL mostrare i link "Cos'è il TOLC" e "FAQ" al centro
3. WHEN l'utente non è autenticato THEN la navbar SHALL mostrare un'icona profilo generica a destra
4. WHEN l'utente clicca sull'icona profilo THEN il sistema SHALL aprire un menu dropdown con "Accedi" e "Registrati"
5. WHEN l'utente clicca fuori dal menu dropdown THEN il sistema SHALL chiudere automaticamente il menu

### Requirement 2

**User Story:** Come utente autenticato, voglio vedere una navbar personalizzata con accesso alle funzionalità dell'app, così da poter navigare efficacemente tra le diverse sezioni.

#### Acceptance Criteria

1. WHEN l'utente è autenticato THEN la navbar SHALL mostrare il logo "UniTOLC" a sinistra
2. WHEN l'utente è autenticato THEN la navbar SHALL mostrare i link "Dashboard", "Pratica", "Statistiche", "Cos'è il TOLC", "FAQ" al centro
3. WHEN l'utente è autenticato THEN la navbar SHALL mostrare l'immagine del profilo utente a destra
4. WHEN l'utente clicca sull'immagine profilo THEN il sistema SHALL aprire un menu dropdown con "Il mio Profilo", "Impostazioni", "Logout"
5. WHEN l'utente clicca fuori dal menu dropdown THEN il sistema SHALL chiudere automaticamente il menu

### Requirement 3

**User Story:** Come utente su dispositivo mobile, voglio una navbar che si adatti al mio schermo, così da poter navigare comodamente anche su schermi piccoli.

#### Acceptance Criteria

1. WHEN la larghezza dello schermo è inferiore a 768px THEN la navbar SHALL mostrare un menu hamburger per i link di navigazione
2. WHEN l'utente clicca sul menu hamburger THEN il sistema SHALL aprire/chiudere il menu mobile con i link di navigazione
3. WHEN il menu mobile è aperto THEN i link SHALL essere disposti verticalmente
4. WHEN l'utente clicca su un link nel menu mobile THEN il sistema SHALL chiudere automaticamente il menu
5. WHEN l'utente ruota il dispositivo THEN la navbar SHALL adattarsi automaticamente al nuovo orientamento

### Requirement 4

**User Story:** Come utente, voglio una navbar con design glassmorphism moderno, così da avere un'esperienza visiva accattivante e professionale.

#### Acceptance Criteria

1. WHEN la navbar viene renderizzata THEN SHALL avere uno sfondo semi-trasparente con rgba(255, 255, 255, 0.25)
2. WHEN la navbar viene renderizzata THEN SHALL applicare backdrop-filter: blur(10px) per l'effetto vetro
3. WHEN la navbar viene renderizzata THEN SHALL avere un bordo sottile per definire i contorni
4. WHEN la navbar viene renderizzata THEN SHALL mantenere la leggibilità del testo su tutti gli sfondi
5. WHEN l'utente fa hover sui link THEN SHALL mostrare un feedback visivo appropriato

### Requirement 5

**User Story:** Come sviluppatore, voglio una navbar che cambi dinamicamente stato tramite JavaScript, così da poter gestire facilmente l'autenticazione utente.

#### Acceptance Criteria

1. WHEN viene aggiunta la classe "logged-in" al body THEN la navbar SHALL mostrare lo stato autenticato
2. WHEN viene rimossa la classe "logged-in" dal body THEN la navbar SHALL mostrare lo stato non autenticato
3. WHEN cambia lo stato di autenticazione THEN la transizione SHALL essere fluida e senza flickering
4. WHEN viene caricata la pagina THEN la navbar SHALL rilevare automaticamente lo stato iniziale
5. IF l'utente effettua login/logout THEN il sistema SHALL aggiornare immediatamente la navbar

### Requirement 6

**User Story:** Come utente, voglio che la navbar sia accessibile e usabile con tastiera e screen reader, così da garantire un'esperienza inclusiva.

#### Acceptance Criteria

1. WHEN l'utente naviga con il tasto Tab THEN tutti gli elementi interattivi SHALL essere raggiungibili
2. WHEN l'utente preme Enter o Spazio sui menu dropdown THEN SHALL aprirsi/chiudersi correttamente
3. WHEN l'utente preme Escape THEN i menu dropdown aperti SHALL chiudersi
4. WHEN viene utilizzato uno screen reader THEN tutti gli elementi SHALL avere etichette appropriate
5. WHEN l'utente naviga con tastiera THEN SHALL essere visibile il focus indicator