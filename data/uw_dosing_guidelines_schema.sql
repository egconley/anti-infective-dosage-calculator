CREATE TABLE IF NOT EXISTS anti_microbial_drugs (
  id SERIAL PRIMARY KEY,
  drug_name VARCHAR(255),
  route VARCHAR(5),
  notes VARCHAR(255),
  agent_type VARCHAR(255),
  multi_temp_var_name boolean
);

CREATE TABLE IF NOT EXISTS dosing_by_CrCl_level (
  id SERIAL PRIMARY KEY,
  drug_name VARCHAR(255),
  CrCl_level VARCHAR(255),
  indication VARCHAR(255),
  dose VARCHAR(255)
);