/** Einmalige lokale Momentaufnahme anlegen, danach genau diesen Stand wiederverwenden. */
const fs=require('node:fs'),path=require('node:path');
const {beispieleDurchlaufen}=require('./prozess.cjs');
const {dateiVorbereiten}=require('./erp_export.cjs');
const projekt=path.resolve(__dirname,'..'),ausgabe=path.join(projekt,'ausgabe');
fs.mkdirSync(ausgabe,{recursive:true});
const eingang=path.join(ausgabe,'prozessergebnisse.json'),ziel=path.join(ausgabe,'erp-export.json');
try{
  let neu=false;
  if(!fs.existsSync(eingang)){
    const originale=JSON.parse(fs.readFileSync(path.join(projekt,'beispieldaten/antraege.json'),'utf8'));
    fs.writeFileSync(eingang,JSON.stringify({hinweis:'Lokale synthetische Vorführung; keine Produktausführung.',ergebnisse:beispieleDurchlaufen(originale)},null,2)+'\n',{flag:'wx'});
    neu=true;
  }
  const plan=dateiVorbereiten(eingang,ziel);
  console.log(JSON.stringify({hinweis:'Nur lokale Vorbereitung. Kein SAP-/Cloudaufruf.',momentaufnahme:neu?'neu-angelegt':'unverändert-wiederverwendet',...plan},null,2));
}catch(fehler){console.error('Vorführung abgebrochen: '+fehler.message);process.exitCode=1;}
