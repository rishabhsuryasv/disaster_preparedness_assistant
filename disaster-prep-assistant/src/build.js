// Dev-only: bakes data/*.json (+ a fresh NDMA SACHET snapshot) into one standalone HTML file.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const dp = (f) => path.join(root, 'data', f);
const read = (f) => JSON.parse(fs.readFileSync(dp(f), 'utf8'));
const inject = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

(async () => {
  // Refresh the offline snapshot of the real alert feed; keep the old one if the network fails.
  try {
    const res = await fetch('https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails', { signal: AbortSignal.timeout(20000) });
    const all = await res.json();
    const keep = ['severity','severity_color','disaster_type','area_description','alert_source','centroid','area_covered','warning_message','actual_lang','effective_start_time','effective_end_time'];
    const data = all.slice(0, 200).map((a) => Object.fromEntries(keep.map((k) => [k, a[k]])));
    fs.writeFileSync(dp('snapshot.json'), JSON.stringify({ t: new Date().toISOString(), data }));
    console.log('snapshot refreshed:', data.length, 'alerts');
  } catch (e) { console.log('snapshot not refreshed (using saved copy):', e.message); }
  let snap = { t: null, data: [] };
  try { snap = read('snapshot.json'); } catch (e) {}

  let tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  tpl = tpl.replace('/*DATA*/', () => inject(read('content.json')))
           .replace('/*UI*/', () => inject(read('i18n.json')))
           .replace('/*TR*/', () => inject(read('content_tr.json')))
           .replace('/*SNAP*/', () => inject(snap));
  fs.writeFileSync(path.join(root, 'DisasterPrepAssistant.html'), tpl);
  console.log('built');
})();
