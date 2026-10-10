// Run: node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import { validateProfile, normalisePhone, personalGroups, LIMITS } from "../profile.js";
import * as data from "../data.js";

const good = () => ({
  name: "Anbu", country: "IN", state: "Tamil Nadu", district: "Chennai", household: "4",
  children: true, elderly: false, disability: false, pets: true, meds: "yes", vehicle: "no",
  contacts: [{ name: "Amma", phone: "+91 98765-43210" }, { name: "", phone: "" }, { name: "", phone: "" }]
});

test("valid profile passes and normalises phone", () => {
  const r = validateProfile(good());
  assert.equal(r.ok, true);
  assert.equal(r.clean.contacts[0].phone, "+919876543210");
  assert.equal(r.clean.household, 4);
});

test("empty required fields are rejected", () => {
  const r = validateProfile({ contacts: [] });
  assert.equal(r.ok, false);
  for (const k of ["name", "country", "household", "meds", "vehicle", "contact0"]) assert.ok(r.errors[k], "missing error for " + k);
});

test("phone formats", () => {
  assert.equal(normalisePhone("9876543210"), "9876543210");
  assert.equal(normalisePhone("+91 98765 43210"), "+919876543210");
  for (const bad of ["abc", "12345", "1234567890123456", "98765x3210", "+", "", "98765;43210", "<b>9876543210</b>", "tel:123456789"]) {
    assert.equal(normalisePhone(bad), null, "should reject " + bad);
  }
});

test("too-long name / contact name / district rejected", () => {
  const a = good(); a.name = "x".repeat(LIMITS.name + 1);
  assert.equal(validateProfile(a).errors.name.key, "errTooLong");
  const b = good(); b.contacts[0].name = "y".repeat(LIMITS.contactName + 1);
  assert.equal(validateProfile(b).errors.contactName0.key, "errTooLong");
  const c = good(); c.district = "z".repeat(LIMITS.district + 1);
  assert.equal(validateProfile(c).errors.district.key, "errTooLong");
});

test("household bounds", () => {
  for (const bad of ["0", "31", "-1", "2.5", "abc", "", "1e3"]) {
    const p = good(); p.household = bad;
    assert.ok(validateProfile(p).errors.household, "should reject household " + bad);
  }
  const p = good(); p.household = "30"; assert.equal(validateProfile(p).ok, true);
});

test("half-filled contact rejected; contact needs name AND phone", () => {
  const p = good(); p.contacts[1] = { name: "Bob", phone: "" };
  assert.equal(validateProfile(p).errors.contact1.key, "errPair");
});

test("script tags are kept as inert text (rendered via textContent), never executed; control chars stripped", () => {
  const p = good(); p.name = '<script>alert(1)</script>\u0000\u0007Bob'; p.district = '"><img src=x onerror=alert(1)>';
  const r = validateProfile(p);
  assert.equal(r.ok, true);
  assert.ok(!/[\u0000-\u001f]/.test(r.clean.name));
  assert.equal(r.clean.name.includes("<script>"), true, "stored as text; XSS safety comes from textContent rendering");
});

test("meds/vehicle only accept yes/no; unknown country rejected; max 3 contacts", () => {
  const p = good(); p.meds = "maybe"; p.country = "ZZ";
  const r = validateProfile(p);
  assert.ok(r.errors.meds); assert.ok(r.errors.country);
  const q = good(); q.contacts = [1, 2, 3, 4, 5].map(i => ({ name: "n" + i, phone: "98765432" + i + "0" }));
  assert.equal(validateProfile(q).clean.contacts.length, 3);
});

test("personalised groups follow the profile", () => {
  const g = personalGroups({ children: true, pets: true, elderly: false, disability: false, meds: "yes", vehicle: "no" }).map(x => x.key);
  assert.deepEqual(g, ["children", "pets", "meds"]);
  assert.deepEqual(personalGroups(null), []);
});

test("every content item has English, Tamil and a known source", () => {
  const items = [];
  for (const h of ["flood", "cyclone"]) {
    for (const ph of Object.values(data.CONTENT[h].checklist)) items.push(...ph);
    for (const c of data.CONTENT[h].cards) for (const s of c.steps) items.push({ id: c.id, src: c.src, text: s });
    for (const x of data.CONTENT[h].top5) items.push({ id: "top5", src: x.src, text: x.text });
  }
  for (const g of data.PERSONAL) items.push(...g.items);
  for (const i of items) {
    assert.ok(i.text.en && i.text.ta, "missing text for " + i.id);
    assert.ok(data.SOURCES[i.src] && data.SOURCES[i.src].url.startsWith("https://"), "bad source for " + i.id);
  }
  const ids = items.filter(i => /^[fcp]-[a-z]{1,2}-?\d+$/.test(i.id)).map(i => i.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate item ids would share checkbox state");
});

test("every contact has name, number, source label+url, and verified status/date", () => {
  for (const c of data.COUNTRIES) for (const k of c.contacts) {
    assert.ok(k.name.en && k.number && k.tel && k.sourceLabel && k.sourceUrl.startsWith("https://"), k.id);
    assert.ok(k.status === "verified" ? /^\d{4}-\d{2}-\d{2}$/.test(k.verified) : k.verified === null, k.id);
  }
});
