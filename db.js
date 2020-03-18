const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

function getAllDrugs() {
  const sql = `SELECT DISTINCT drug_name 
  FROM anti_microbial_drugs a
  WHERE drug_name IN
  (SELECT DISTINCT drug_name
   FROM dosing_by_crcl_level)
  ORDER BY drug_name;`;
  return client.query(sql);
}

function getDrugsWithIndications() {
  const sql = `SELECT DISTINCT
              a.drug_name, b.indication
              FROM anti_microbial_drugs a
              LEFT JOIN dosing_by_CrCl_level b ON a.drug_name = b.drug_name
              WHERE (b.indication IS NULL)=FALSE
              ORDER BY drug_name;`;
  return client.query(sql);
}

// get dose
function getDoseQuery(drug, indication, creatinineClearance) {
  let doseQuery;
  const sqlIndicationHemoD = `SELECT DISTINCT
                                a.drug_name, 
                                a.route, 
                                b.crcl_level, 
                                b.indication, 
                                b.dose, 
                                a.notes
                                FROM anti_microbial_drugs a
                                LEFT JOIN hd_dosing b ON a.drug_name = b.drug_name
                                WHERE a.drug_name = $1 AND b.indication like $2
                                ORDER BY drug_name;`;
  const sqlIndicationCrCl = `SELECT DISTINCT
                              a.drug_name, 
                              a.route, 
                              b.crcl_level, 
                              b.indication, 
                              b.dose, 
                              a.notes
                              FROM anti_microbial_drugs a
                              LEFT JOIN dosing_by_CrCl_level b ON a.drug_name = b.drug_name
                              WHERE a.drug_name = $1 AND $2 > b.crcl_cutoff_low AND $2 < b.crcl_cutoff_high AND b.indication like $3
                              ORDER BY drug_name;`;    
  const sqlNoIndicationHemoD = `SELECT DISTINCT
                                a.drug_name, 
                                a.route, 
                                b.crcl_level, 
                                b.indication, 
                                b.dose, 
                                a.notes
                                FROM anti_microbial_drugs a
                                LEFT JOIN hd_dosing b ON a.drug_name = b.drug_name
                                WHERE a.drug_name = $1
                                ORDER BY drug_name`;
  const sqlNoIndicationCrCl = `SELECT DISTINCT
                                a.drug_name, 
                                a.route, 
                                b.crcl_level, 
                                b.indication, 
                                b.dose, 
                                a.notes
                                FROM anti_microbial_drugs a
                                LEFT JOIN dosing_by_CrCl_level b ON a.drug_name = b.drug_name
                                WHERE a.drug_name = $1 AND $2 > b.crcl_cutoff_low AND $2 < b.crcl_cutoff_high
                                ORDER BY drug_name;`;                           
  if (indication) {
    if (isNaN(creatinineClearance)) {
      doseQuery = {
        text: sqlIndicationHemoD,
        values: [`${drug}`, `${indication}%`],
      }
    } else {
      doseQuery = {
        text: sqlIndicationCrCl,
        values: [`${drug}`, `${creatinineClearance}`, `${indication}%`],
      }
    }
  } else {
    if (isNaN(creatinineClearance)) {
      doseQuery = {
        text: sqlNoIndicationHemoD,
        values: [`${drug}`],
      }
    } else {
      doseQuery = {
        text: sqlNoIndicationCrCl,
        values: [`${drug}`, `${creatinineClearance}`],
      }
    }
  }
  return doseQuery;
}

function getDoseGuidelines(selectedDrug, selectedIndication, creatinineClearance) {
  const sql = getDoseQuery(selectedDrug, selectedIndication, creatinineClearance);
  return client.query(sql);
}

exports.getAllDrugs = getAllDrugs;
exports.getDrugsWithIndications = getDrugsWithIndications;
exports.getDoseGuidelines = getDoseGuidelines;
