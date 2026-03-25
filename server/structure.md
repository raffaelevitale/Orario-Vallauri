# API
### login
##### **Method**: POST
**Receive**: 
- email -> email dell'utente loggato.
**Send**: 
- string -> token JWT
Serve per loggarsi tramite l'account google.
##### **Method**: GET
**Receive**: 
- JWT -> token dal header bearer.
**Send**: 
- 401 -> token scaduto
- 200 -> token ancora valido
Serve per verificare la validità del token
### orario_classe/:id
##### middleware: auth
##### **Method**: GET
**Receive**: 
- day -> giorno della settimana
**Send**: 
- 200 -> json con l'orario della classe
- 400 -> day sbagliato
### orario_docente/:id
##### middleware: auth
##### **Method**: GET
**Receive**: 
- day -> giorno della settimana
**Send**: 
- 200 -> json con l'orario del docente
- 400 -> day sbagliato
### orari_classi
##### middleware: auth
##### **Method**: GET
**Send**: 
- 200 -> json con gli orari delle classi
### orari_docenti
##### middleware: auth
##### **Method**: GET
**Send**: 
- 200 -> json con gli orari dei docenti
