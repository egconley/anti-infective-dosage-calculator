--heroku pg:reset DATABASE -a dosage-calculator
--heroku pg:psql -f uw_dosing_guidelines_schema.sql -a dosage-calculator

--DROP TABLE IF EXISTS anti_microbial_drugs;

CREATE TABLE IF NOT EXISTS anti_microbial_drugs (
  id SERIAL PRIMARY KEY,
  drug_name VARCHAR(255),
  route VARCHAR(5),
  notes VARCHAR(255),
  agent_type VARCHAR(255),
  drug_name_short VARCHAR(255)
);

\copy anti_microbial_drugs (drug_name, route, notes, agent_type, drug_name_short) FROM 'anti_microbial_drugsEXP-12-28-19.csv' WITH CSV HEADER; 

--DROP TABLE IF EXISTS dosing_by_CrCl_level;

CREATE TABLE IF NOT EXISTS dosing_by_CrCl_level (
  id SERIAL PRIMARY KEY,
  drug_name VARCHAR(255),
  CrCl_level VARCHAR(255),
  indication VARCHAR(255),
  dose VARCHAR(255),
  CrCl_cutoff_high float,
  CrCl_cutoff_low float,
  drug_name_short VARCHAR(255)
);

\copy dosing_by_crcl_level (drug_name, crcl_level, indication, dose, crcl_cutoff_high, crcl_cutoff_low, drug_name_short) FROM 'dosing_by_crcl_levelEXP-12-30-19.csv' WITH CSV HEADER; 

--hd_dosingEXP-12-28-19.csv

--DROP TABLE IF EXISTS hd_dosing;

CREATE TABLE IF NOT EXISTS hd_dosing (
  id SERIAL PRIMARY KEY,
  drug_name VARCHAR(255),
  CrCl_level VARCHAR(255),
  indication VARCHAR(255),
  dose VARCHAR(255),
  CrCl_cutoff_high float,
  CrCl_cutoff_low float,
  drug_name_short VARCHAR(255)
);

\copy hd_dosing (drug_name, crcl_level, indication, dose, crcl_cutoff_high, crcl_cutoff_low, drug_name_short) FROM 'hd_dosingEXP-12-31-19.csv' WITH CSV HEADER; 
