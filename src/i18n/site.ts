import type { Lang } from "@/lib/lang";

/**
 * UI strings for the site chrome and static pages. Elements opt in with data-i18n="key";
 * logbook entries themselves stay in the language they were written in.
 */
const en = {
  "nav.home": "Home",
  "nav.logbook": "Logbook",
  "nav.boats": "Boats",
  "nav.records": "Records",
  "nav.academy": "Sailing Academy",
  "nav.about": "About",
  "nav.admin": "Admin",
  "ui.language": "Language",
  "footer.fair": "Fair winds ⛵",
  "footer.weather": "Weather & sea",
  "home.kicker": "Sail · Learn · Log",
  "home.title": "Learning the wind, one sail at a time.",
  "home.lead": "Every sail with its track, wind and lessons learned, plus live conditions before heading out.",
  "home.openLogbook": "Open the logbook",
  "home.meetBoat": "Meet the boat",
  "home.meetBoats": "Meet the boats",
  "home.academy": "Sailing Academy",
  "home.activityKicker": "Sailing activity · last 12 months",
  "home.daysOnWater": "Days on the water",
  "home.latest": "Latest sails",
  "home.allEntries": "All entries →",
  "home.noSails": "No sails logged yet. Fair winds!",
  "stat.sails": "Sails logged",
  "stat.distance": "Distance",
  "stat.time": "Time sailing",
  "stat.top": "Top speed",
  "about.kicker": "About me",
  "about.title": "Hi, I'm Melih.",
  "about.p1":
    "I'm a network engineer by trade and a sailor by passion. I've been sailing for about two and a half years, mostly small keelboats on Dutch lakes.",
  "about.p2":
    "I built this site to keep a proper log of every sail and to collect what I learn about sailing, wind and seamanship in one place. Writing down how each sail went, what I practised and what went wrong is how I get better on the water.",
  "about.p3": "The goal is simple: become a more confident, more competent sailor, one sail at a time.",
  "academy.kicker": "Learn · Practise · Sail",
  "academy.lead": "Free, interactive training modules for real sailing skills. Pick a module and start.",
};

export type SiteKey = keyof typeof en;

const nl: Record<SiteKey, string> = {
  "nav.home": "Home",
  "nav.logbook": "Logboek",
  "nav.boats": "Boten",
  "nav.records": "Records",
  "nav.academy": "Zeilacademie",
  "nav.about": "Over mij",
  "nav.admin": "Admin",
  "ui.language": "Taal",
  "footer.fair": "Behouden vaart ⛵",
  "footer.weather": "Weer & zee",
  "home.kicker": "Zeilen · Leren · Loggen",
  "home.title": "De wind leren kennen, tocht voor tocht.",
  "home.lead": "Elke zeiltocht met track, wind en lessen, plus actuele omstandigheden voordat je vertrekt.",
  "home.openLogbook": "Open het logboek",
  "home.meetBoat": "Bekijk de boot",
  "home.meetBoats": "Bekijk de boten",
  "home.academy": "Zeilacademie",
  "home.activityKicker": "Zeilactiviteit · laatste 12 maanden",
  "home.daysOnWater": "Dagen op het water",
  "home.latest": "Laatste tochten",
  "home.allEntries": "Alle tochten →",
  "home.noSails": "Nog geen tochten gelogd. Behouden vaart!",
  "stat.sails": "Tochten gelogd",
  "stat.distance": "Afstand",
  "stat.time": "Tijd op het water",
  "stat.top": "Topsnelheid",
  "about.kicker": "Over mij",
  "about.title": "Hoi, ik ben Melih.",
  "about.p1":
    "Ik ben netwerkengineer van beroep en zeiler uit passie. Ik zeil nu ongeveer tweeënhalf jaar, vooral in kleine kielboten op Nederlandse meren.",
  "about.p2":
    "Ik heb deze site gemaakt om van elke tocht een goed logboek bij te houden en alles wat ik leer over zeilen, wind en zeemanschap op één plek te verzamelen. Opschrijven hoe een tocht ging, wat ik oefende en wat er misging, maakt me beter op het water.",
  "about.p3": "Het doel is simpel: een zelfverzekerdere en bekwamere zeiler worden, tocht voor tocht.",
  "academy.kicker": "Leren · Oefenen · Zeilen",
  "academy.lead": "Gratis, interactieve trainingsmodules voor echte zeilvaardigheden. Kies een module en begin.",
};

const tr: Record<SiteKey, string> = {
  "nav.home": "Ana sayfa",
  "nav.logbook": "Seyir defteri",
  "nav.boats": "Tekneler",
  "nav.records": "Rekorlar",
  "nav.academy": "Yelken Akademisi",
  "nav.about": "Hakkımda",
  "nav.admin": "Admin",
  "ui.language": "Dil",
  "footer.fair": "Rüzgarın bol olsun ⛵",
  "footer.weather": "Hava & deniz",
  "home.kicker": "Yelken · Öğren · Kaydet",
  "home.title": "Rüzgarı her seyirde biraz daha iyi tanımak.",
  "home.lead": "Her seyir; rotası, rüzgarı ve çıkardığım derslerle. Ayrıca denize çıkmadan önce anlık koşullar.",
  "home.openLogbook": "Seyir defterini aç",
  "home.meetBoat": "Tekneyle tanış",
  "home.meetBoats": "Teknelerle tanış",
  "home.academy": "Yelken Akademisi",
  "home.activityKicker": "Yelken aktivitesi · son 12 ay",
  "home.daysOnWater": "Suda geçen günler",
  "home.latest": "Son seyirler",
  "home.allEntries": "Tüm kayıtlar →",
  "home.noSails": "Henüz seyir kaydı yok. Rüzgarın bol olsun!",
  "stat.sails": "Kayıtlı seyir",
  "stat.distance": "Mesafe",
  "stat.time": "Seyir süresi",
  "stat.top": "En yüksek hız",
  "about.kicker": "Hakkımda",
  "about.title": "Merhaba, ben Melih.",
  "about.p1":
    "Mesleğim network mühendisliği, tutkum yelken. Yaklaşık iki buçuk yıldır yelken yapıyorum; çoğunlukla Hollanda göllerinde küçük omurgalı teknelerle.",
  "about.p2":
    "Bu siteyi her seyrin düzgün bir kaydını tutmak ve yelken, rüzgar ve denizcilik hakkında öğrendiklerimi tek bir yerde toplamak için yaptım. Her seyrin nasıl geçtiğini, neler çalıştığımı ve neyin ters gittiğini yazmak suda daha iyi olmamı sağlıyor.",
  "about.p3": "Amacım basit: her seyirle daha özgüvenli ve daha yetkin bir denizci olmak.",
  "academy.kicker": "Öğren · Pratik yap · Yelken aç",
  "academy.lead": "Gerçek yelken becerileri için ücretsiz, etkileşimli eğitim modülleri. Bir modül seç ve başla.",
};

export const SITE_STRINGS: Record<Lang, Record<SiteKey, string>> = { en, nl, tr };
