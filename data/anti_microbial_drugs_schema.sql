CREATE TABLE IF NOT EXISTS anti_microbial_drugs (
  id SERIAL PRIMARY KEY,
  drug_name VARCHAR(255),
  route VARCHAR(5),
  notes VARCHAR(255),
  agent_type VARCHAR(255)
);
