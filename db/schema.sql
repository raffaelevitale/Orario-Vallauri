CREATE TABLE IF NOT EXISTS 'users' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   email VARCHAR(255) NOT NULL UNIQUE,
   is_admin BOOLEAN NOT NULL DEFAULT 0,
);

CREATE TABLE IF NOT EXISTS 'tokens' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   id_user int NOT NULL,
   token VARCHAR(255) NOT NULL UNIQUE,
   expires_at DATETIME NOT NULL,
);

CREATE TABLE IF NOT EXISTS 'orari' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   ora_inizio TIME NOT NULL,
   ora_fine TIME NOT NULL,
   n_ora INT NOT NULL,
   settore_tecnico BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS 'indirizzi' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS 'sezioni' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS 'classi' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   sezione_id INT NOT NULL,
   indirizzo_id INT NOT NULL,
   FOREIGN KEY (sezione_id) REFERENCES sezioni(id),
   FOREIGN KEY (indirizzo_id) REFERENCES indirizzi(id)
);

CREATE TABLE IF NOT EXISTS 'materie' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS 'aule' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS 'docenti' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   nominativo VARCHAR(255) NOT NULL,
);


CREATE TABLE IF NOT EXISTS 'orario_classi_standard' (
   classe_id INT NOT NULL,
   giorno INT NOT NULL,
   ora_id INT NOT NULL,
   materia_id INT NOT NULL,
   id_docente VARCHAR(255) NOT NULL,
   id_docente_lab VARCHAR(255) DEFAULT NULL,
   aula_id INT NOT NULL,
   PRIMARY KEY (classe_id, giorno, ora_id),
   FOREIGN KEY (classe_id) REFERENCES classi(id),
   FOREIGN KEY (ora_id) REFERENCES orari(id),
   FOREIGN KEY (materia_id) REFERENCES materie(id),
   FOREIGN KEY (aula_id) REFERENCES aule(id),
   FOREIGN KEY (id_docente) REFERENCES docenti(id),
   FOREIGN KEY (id_docente_lab) REFERENCES docenti(id)
);

CREATE TABLE IF NOT EXISTS 'orario_classi_straordinario' (
   classe_id INT NOT NULL,
   aula_id INT NOT NULL,
   ora_id INT NOT NULL,
   materia_id INT DEFAULT NULL,
   id_docente VARCHAR(255) DEFAULT NULL,
   decorrenza DATE NOT NULL,
   PRIMARY KEY (classe_id, ora_id, decorrenza),
   FOREIGN KEY (classe_id) REFERENCES classi(id),
   FOREIGN KEY (ora_id) REFERENCES orari(id),
   FOREIGN KEY (materia_id) REFERENCES materie(id),
   FOREIGN KEY (aula_id) REFERENCES aule(id),
   FOREIGN KEY (id_docente) REFERENCES docenti(id)
);

CREATE TABLE IF NOT EXISTS 'orario_docenti_standard' (
   id_docente VARCHAR(255) NOT NULL,
   id_docente_lab VARCHAR(255) DEFAULT NULL,
   giorno INT NOT NULL,
   ora_id INT NOT NULL,
   classe_id INT NOT NULL,
   materia_id INT NOT NULL,
   aula_id INT NOT NULL,
   PRIMARY KEY (id_docente, giorno, ora_id),
   FOREIGN KEY (classe_id) REFERENCES classi(id),
   FOREIGN KEY (ora_id) REFERENCES orari(id),
   FOREIGN KEY (materia_id) REFERENCES materie(id),
   FOREIGN KEY (aula_id) REFERENCES aule(id),
   FOREIGN KEY (id_docente) REFERENCES docenti(id),
   FOREIGN KEY (id_docente_lab) REFERENCES docenti(id)
);

CREATE TABLE IF NOT EXISTS 'orario_docenti_straordinario' (
   id_docente VARCHAR(255) NOT NULL,
   ora_id INT NOT NULL,
   classe_id INT NOT NULL,
   aula_id INT NOT NULL,
   materia_id INT DEFAULT NULL,
   decorrenza DATE NOT NULL,
   PRIMARY KEY (id_docente, ora_id, decorrenza),
   FOREIGN KEY (classe_id) REFERENCES classi(id),
   FOREIGN KEY (ora_id) REFERENCES orari(id),
   FOREIGN KEY (materia_id) REFERENCES materie(id),
   FOREIGN KEY (aula_id) REFERENCES aule(id),
   FOREIGN KEY (id_docente) REFERENCES docenti(id)
);

CREATE TABLE IF NOT EXISTS 'pub_nuovo_orario' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   id_admin INT NOT NULL,
   data_pubblicazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (id_admin) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS 'pub_nuovo_orario_straordinario' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   id_admin INT NOT NULL,
   data_pubblicazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   decorrenza DATE NOT NULL,
   FOREIGN KEY (id_admin) REFERENCES users(id)
);
