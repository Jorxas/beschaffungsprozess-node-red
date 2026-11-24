/** Lokaler Exportvertrag; weder SAP-Aufruf noch Power-Automate-Ausführung. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const pruefsumme=daten=>crypto.createHash('sha256').update(JSON.stringify(daten)).digest('hex');
function exportdaten(antrag){
  if(!antrag || typeof antrag.id!=='string' || !/^A\d{2}$/.test(antrag.id))throw Error('Ungültige Antragskennung.');
  if(antrag.zustand!=='genehmigt')return {grund:'Kein genehmigter Antrag.'};
  const entscheidung=antrag.aenderungen?.at(-1);
  if(!entscheidung)return {grund:'Importierter Endzustand ohne neue überprüfbare Freigabespur.'};
  const cent=Math.round(antrag.betrag*100);
  if(!Number.isFinite(antrag.betrag)||!Number.isSafeInteger(cent)||cent<=0||cent>50000
    ||Math.abs(antrag.betrag*100-cent)>1e-8||antrag.waehrung!=='EUR')throw Error('Exportbetrag außerhalb des lokalen Vertrags.');
  if(entscheidung.aktion!=='genehmigen'||entscheidung.nach!=='genehmigt'
    ||entscheidung.betrag!==antrag.betrag||entscheidung.waehrung!=='EUR'
    ||entscheidung.person?.rolle!=='freigabeverantwortlicher'
    ||typeof entscheidung.person.kennung!=='string'||!entscheidung.person.kennung.trim()
    ||entscheidung.person.kennung===antrag.antragsteller
    ||entscheidung.bedarf_begruendet!==true||entscheidung.budget_verfuegbar!==true
    ||!entscheidung.begruendung?.trim()||!entscheidung.entscheidungskriterium?.trim()
    ||!Number.isFinite(Date.parse(entscheidung.zeitpunkt))
    ||new Date(entscheidung.zeitpunkt).toISOString()!==entscheidung.zeitpunkt)throw Error('Freigabespur widerspricht dem Exportvertrag.');
  return {daten:{formatversion:1,exportkennung:'uebung-'+antrag.id,antrag_id:antrag.id,betrag_cent:cent,
    waehrung:'EUR',genehmigt_am:entscheidung.zeitpunkt,freigabe_person:entscheidung.person.kennung,
    begruendung:entscheidung.begruendung,entscheidungskriterium:entscheidung.entscheidungskriterium}};
}
function planen(ergebnisse,alt={formatversion:1,eintraege:[]}){
  if(!Array.isArray(ergebnisse)||!ergebnisse.length||alt.formatversion!==1||!Array.isArray(alt.eintraege))throw Error('Ungültiges Exportformat.');
  const gespeichert=new Map();
  for(const eintrag of alt.eintraege){
    if(!eintrag.daten?.exportkennung||gespeichert.has(eintrag.daten.exportkennung)||pruefsumme(eintrag.daten)!==eintrag.sha256)throw Error('Gespeicherter Export ist beschädigt oder doppelt.');
    gespeichert.set(eintrag.daten.exportkennung,structuredClone(eintrag));
  }
  const gesehen=new Set(),befunde=[];
  for(const ergebnis of ergebnisse){
    const antrag=ergebnis.antrag;
    if(!antrag?.id||gesehen.has(antrag.id))throw Error('Antragskennung im Eingang fehlt oder ist doppelt.');
    gesehen.add(antrag.id);
    const auswahl=exportdaten(antrag);
    if(!auswahl.daten){befunde.push({antrag:antrag.id,status:'ausgelassen',grund:auswahl.grund});continue;}
    const {daten}=auswahl,hash=pruefsumme(daten),vorher=gespeichert.get(daten.exportkennung);
    if(vorher&&vorher.sha256!==hash)throw Error('Exportkonflikt: '+daten.exportkennung+' wurde bereits mit anderem Inhalt vorbereitet.');
    if(!vorher)gespeichert.set(daten.exportkennung,{daten,sha256:hash});
    befunde.push({antrag:antrag.id,status:vorher?'bereits-vorbereitet':'neu-vorbereitet'});
  }
  return {speicher:{formatversion:1,eintraege:[...gespeichert.values()].sort((a,b)=>a.daten.exportkennung.localeCompare(b.daten.exportkennung))},befunde};
}
function dateiVorbereiten(eingang,ziel){
  if(path.resolve(eingang).toLowerCase()===path.resolve(ziel).toLowerCase())throw Error('Quelle und Export müssen verschieden sein.');
  if(fs.existsSync(ziel)&&fs.lstatSync(ziel).isSymbolicLink())throw Error('Keine symbolische Exportdatei verwenden.');
  const alt=fs.existsSync(ziel)?JSON.parse(fs.readFileSync(ziel,'utf8')):undefined;
  const plan=planen(JSON.parse(fs.readFileSync(eingang,'utf8')).ergebnisse,alt);
  fs.mkdirSync(path.dirname(ziel),{recursive:true});
  if(!alt||pruefsumme(alt)!==pruefsumme(plan.speicher)){
    const zwischen=ziel+'.'+process.pid+'.neu';
    try{fs.writeFileSync(zwischen,JSON.stringify(plan.speicher,null,2)+'\n',{flag:'wx'});fs.renameSync(zwischen,ziel);}
    finally{if(fs.existsSync(zwischen))fs.unlinkSync(zwischen);}
  }
  return plan;
}
module.exports={exportdaten,planen,dateiVorbereiten};
if(require.main===module){
  try{
    if(process.argv.length!==3)throw Error('Aufruf: node src/erp_export.cjs <gespeicherte lokale Prozessergebnisse.json>');
    const ziel=path.join(__dirname,'../ausgabe/erp-export.json');
    console.log(JSON.stringify({hinweis:'Nur lokale Exportvorbereitung; kein SAP-/ERP-/Cloudaufruf.',...dateiVorbereiten(path.resolve(process.argv[2]),ziel)},null,2));
  }catch(fehler){console.error('Export abgewiesen: '+fehler.message);process.exitCode=1;}
}
