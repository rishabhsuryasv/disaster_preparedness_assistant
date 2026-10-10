# TODO / status
- [x] Step 0 endpoint + contact verification
- [x] Step 1 data file, skeleton, hazard/phase nav, country selector, language switch
- [x] Step 2 contacts, checklists (persisted), safety cards (sourced), Emergency mode
- [x] Step 3 profile + personalised instructions (tests: npm test)
- [x] Step 4 service worker / manifest / offline (npm run test:e2e)
- [ ] Step 5 live alerts + Netlify proxy
- [ ] Step 6 QA + deploy
- [ ] Step 7 optional Supabase backup (last)
Unverified: 112 (112.gov.in unreachable), all Tamil text (needs native review), non-India contacts.
Notes (Step 2):
- All Tamil strings (UI + 52 checklist items + 4 cards + top-5) are AI-written, flagged needs-native-speaker-review. No official Tamil NDMA/TNSDMA text found.
- Flood content source = IMD-hosted PDF (issuer not named in doc; not claimed as NDMA). Cyclone = NDMA circular (hosted by Govt of Puducherry) + NDMA cyclone page.
- tnsdma.tn.gov.in and 112.gov.in unreachable from build machine -> 112 unverified; TN numbers come from labour.tn.gov.in.
- Hazard-specific content for non-India countries: none (India sources only) -> UI should say so (TODO).
Notes (Step 3):
- Personalised tips come from Ready.gov (US gov, general guidance, labelled in UI) + NDMA/IMD lines. No "child ID" tip: no source found.
- Delete my data removes profile + checklist progress; keeps language/country settings. Cloud row deletion = Step 7 (hook event "dpa:deleted").
- Fixed: native replaceChildren() stringifies arrays/null (contact rows had rendered as text). Only el() flattens.
- After delete, reloading #/profile?deleted=1 re-shows the "deleted" message (cosmetic).
- Dev server must be restarted each session: python -m http.server 8080 in project dir.
Notes (Step 4):
- The in-app Claude browser pane CANNOT register service workers (fails "unknown error fetching the script"); offline is tested with real Chrome via playwright-core (tests/e2e). Real phone: NOT TESTED.
- BUMP VERSION in sw.js whenever shell files change. tests/offline.test.mjs fails if a file is missing from the precache list.
- Install prompt / Lighthouse installability: NOT TESTED yet (needs HTTPS deploy).
Notes (Step 5):
- SACHET feed = RSS 2.0 at /cap_public_website/rss/rss_india.xml (NOT /CapFeed, which is an HTML page). Titles list DISTRICTS not states; <author> has issuing agency. District lists exist ONLY for Tamil Nadu (data.js ALERT_AREAS).
- ThinkHazard FLAPS (observed 404/timeouts ~06:28-06:40 GMT, then 404,404,200 pattern). Proxy retries fast failures 3x; app keeps last saved levels; sample-alerts.json has a real snapshot (labelled SAMPLE).
- Empty feed with existing cache is treated as a failed refresh (keeps saved alerts).
- Notifications work only while the app is open; tested with a STUBBED Notification (logic only). Real OS permission prompt: NOT TESTED.
- Proxy NOT yet deployed on Netlify: deployed /api behaviour (function routing, cold start, timeouts) is NOT TESTED until Step 6.
- Bottom-nav Tamil labels shortened (navContacts/navSettings) to stop clipping at 360px.
Notes (Step 6 - QA, local):
- npm test = 45 unit/static tests; npm run test:e2e = 6 Playwright scripts (offline, control, alerts, journeys, layout, perf3g) in real Chrome.
- Link check (npm run check:links): 112.gov.in unreachable from build machine; ndrrmc.gov.ph 403 (bot block). Verify by hand.
- Location permission: app does not use geolocation (N/A). Real phone / real OS notification prompt / Lighthouse on deployed URL: NOT TESTED.
