DROP TABLE IF EXISTS anti_microbial_drugs;

CREATE TABLE IF NOT EXISTS anti_microbial_drugs (
  id int,
  drug_name VARCHAR(255),
  route VARCHAR(5),
  notes VARCHAR(255),
  agent_type VARCHAR(255),
  drug_name_short VARCHAR(255)
);

DROP TABLE IF EXISTS anti_microbial_drugs;

CREATE TABLE IF NOT EXISTS dosing_by_CrCl_level (
  id int,
  drug_name VARCHAR(255),
  CrCl_level VARCHAR(255),
  indication VARCHAR(255),
  dose VARCHAR(255),
  CrCl_cutoff_high float,
  CrCl_cutoff_low float,
  drug_name_short VARCHAR(255)
);