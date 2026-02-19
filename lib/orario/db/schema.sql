CREATE TABLE IF NOT EXISTS 'admins' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   email VARCHAR(255) NOT NULL UNIQUE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS 'orari' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   ora_inizio TIME NOT NULL,
   ora_fine TIME NOT NULL,
   n_ora INT NOT NULL
);

CREATE TABLE IF NOT EXISTS 'indirizzi' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS 'classi' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   nome VARCHAR(255) NOT NULL UNIQUE,
   indirizzo_id INT NOT NULL,
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

CREATE TABLE IF NOT EXISTS 'orario_classi_standard' (
   classe_id INT NOT NULL,
   giorno INT NOT NULL,
   ora_id INT NOT NULL,
   materia_id INT NOT NULL,
   docente VARCHAR(255) NOT NULL,
   docente_lab VARCHAR(255) DEFAULT NULL,
   aula_id INT NOT NULL,
   PRIMARY KEY (classe_id, giorno, ora_id),
   FOREIGN KEY (classe_id) REFERENCES classi(id),
   FOREIGN KEY (ora_id) REFERENCES orari(id),
   FOREIGN KEY (materia_id) REFERENCES materie(id),
   FOREIGN KEY (aula_id) REFERENCES aule(id)
);

CREATE TABLE IF NOT EXISTS 'orario_classi_straordinario' (
   classe_id INT NOT NULL,
   aula_id INT NOT NULL,
   ora_id INT NOT NULL,
   materia_id INT DEFAULT NULL,
   docente VARCHAR(255) DEFAULT NULL,
   decorrenza DATE NOT NULL,
   PRIMARY KEY (classe_id, ora_id, decorrenza),
   FOREIGN KEY (classe_id) REFERENCES classi(id),
   FOREIGN KEY (ora_id) REFERENCES orari(id),
   FOREIGN KEY (materia_id) REFERENCES materie(id),
   FOREIGN KEY (aula_id) REFERENCES aule(id)
);

CREATE TABLE IF NOT EXISTS 'orario_docenti_standard' (
   docente VARCHAR(255) NOT NULL,
   docente_lab VARCHAR(255) DEFAULT NULL,
   giorno INT NOT NULL,
   ora_id INT NOT NULL,
   classe_id INT NOT NULL,
   materia_id INT NOT NULL,
   aula_id INT NOT NULL,
   PRIMARY KEY (docente, giorno, ora_id),
   FOREIGN KEY (classe_id) REFERENCES classi(id),
   FOREIGN KEY (ora_id) REFERENCES orari(id),
   FOREIGN KEY (materia_id) REFERENCES materie(id),
   FOREIGN KEY (aula_id) REFERENCES aule(id)
);

CREATE TABLE IF NOT EXISTS 'orario_docenti_straordinario' (
   docente VARCHAR(255) NOT NULL,
   ora_id INT NOT NULL,
   classe_id INT NOT NULL,
   aula_id INT NOT NULL,
   materia_id INT DEFAULT NULL,
   decorrenza DATE NOT NULL,
   PRIMARY KEY (docente, ora_id, decorrenza),
   FOREIGN KEY (classe_id) REFERENCES classi(id),
   FOREIGN KEY (ora_id) REFERENCES orari(id),
   FOREIGN KEY (materia_id) REFERENCES materie(id),
   FOREIGN KEY (aula_id) REFERENCES aule(id)
);

CREATE TABLE IF NOT EXISTS 'pub_nuovo_orario' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   id_admin INT NOT NULL,
   data_pubblicazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (id_admin) REFERENCES admins(id)
);

CREATE TABLE IF NOT EXISTS 'pub_nuovo_orario_straordinario' (
   id INT AUTO_INCREMENT PRIMARY KEY,
   id_admin INT NOT NULL,
   data_pubblicazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   decorrenza DATE NOT NULL,
   FOREIGN KEY (id_admin) REFERENCES admins(id)
);

