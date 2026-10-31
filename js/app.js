import { createStore } from "./store.js";

// ------------------------------------------------------------------
//  Constantes
// ------------------------------------------------------------------
const CATEGORIES = ["Fruits & légumes", "Viande & poisson", "Produits laitiers", "Surgelés", "Épicerie salée",
  "Épicerie sucrée", "Boissons", "Pain & viennoiseries", "Hygiène & entretien", "Autre"];
const UNITES = ["pièce", "g", "kg", "mL", "L", "paquet", "boîte", "pot", "sachet", "bouteille"];
const TYPES = { frigo: "Frigo", congelateur: "Congélateur", placard: "Placard", autre: "Autre" };
const ICONES = ["🧊", "❄️", "🥶", "🗄️", "🥫", "🍷", "🧺", "📦"];

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pas = (u) => (u === "g" || u === "mL" ? 100 : u === "kg" || u === "L" ? 0.5 : 1);
const fmtQ = (q) => (Number.isInteger(+q) ? String(+q) : String(+(+q).toFixed(2)).replace(".", ","));
const joursAvant = (d) => (d ? Math.round((new Date(d + "T00:00:00") - new Date(new Date().toDateString())) / 864e5) : null);
const estBas = (p) => p.toujours_stock && +p.quantite <= +p.seuil_min;
const bientotPerime = (p) => { const j = joursAvant(p.peremption); return j !== null && j <= 3; };

// ------------------------------------------------------------------
//  État
// ------------------------------------------------------------------
const S = {
  store: null, user: null, foyer: null,
  emplacements: [], produits: [],
  onglet: "stock", filtre: "tout", recherche: "",
  bas: new Set(), // ids sous le seuil (pour ne notifier qu'au franchissement)
};

// ------------------------------------------------------------------
//  Démarrage
// ------------------------------------------------------------------
async function demarrer() {
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  try {
    S.store = await createStore();
    S.user = await S.store.session();
    if (!S.user) return vueConnexion();
    S.foyer = await S.store.getFoyer();
    if (!S.foyer) return vueFoyer();
    await charger();
    S.store.subscribe(debounce(async () => { await charger(); }, 250));
    document.addEventListener("visibilitychange", () => { if (!document.hidden) charger(); });
  } catch (e) {
    $("#app").innerHTML = `<div class="ecran-centre"><h1>Connexion impossible</h1><p>${esc(e.message)}</p><button class="btn" onclick="location.reload()">Réessayer</button></div>`;
  }
}

async function charger() {
  [S.emplacements, S.produits, S.foyer] = await Promise.all([S.store.listEmplacements(), S.store.listProduits(), S.store.getFoyer()]);
  verifierAlertes();
  rendre();
}

function debounce(f, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; }

// ------------------------------------------------------------------
//  Alertes : badge sur l'icône + notification au franchissement du seuil
// ------------------------------------------------------------------
function verifierAlertes() {
  const bas = S.produits.filter(estBas);
  const nouveaux = bas.filter((p) => !S.bas.has(p.id));
  const premierPassage = S.bas.size === 0 && !S._init;
  S._init = true;
  S.bas = new Set(bas.map((p) => p.id));
  const n = bas.length + S.produits.filter(bientotPerime).length;
  if (navigator.setAppBadge) (n ? navigator.setAppBadge(n) : navigator.clearAppBadge()).catch(() => {});
  if (!premierPassage && nouveaux.length && "Notification" in window && Notification.permission === "granted") {
    navigator.serviceWorker?.ready.then((reg) => reg.showNotification("Stock bas", {
      body: nouveaux.map((p) => `${p.nom} : ${fmtQ(p.quantite)} ${p.unite}`).join("\n"),
      icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: "stock-bas",
    })).catch(() => {});
  }
}

// ------------------------------------------------------------------
//  Écrans de connexion et de foyer
// ------------------------------------------------------------------
function vueConnexion(erreur = "") {
  $("#app").innerHTML = `
  <main class="ecran-centre">
    <div class="logo-grand" aria-hidden="true">${logoSVG()}</div>
    <h1>Stock Maison</h1>
    <p class="sous">Ce qu'il y a dans le frigo, les congélateurs et les placards, sur vos deux téléphones.</p>
    <form id="f-auth" class="form">
      <label>E-mail<input name="email" type="email" autocomplete="email" required></label>
      <label>Mot de passe<input name="password" type="password" autocomplete="current-password" minlength="6" required></label>
      ${erreur ? `<p class="erreur">${esc(erreur)}</p>` : ""}
      <button class="btn" name="action" value="in">Se connecter</button>
      <button class="btn btn-sec" name="action" value="up">Créer un compte</button>
    </form>
  </main>`;
  $("#f-auth").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const action = ev.submitter?.value;
    try {
      S.user = action === "up" ? await S.store.signUp(fd.get("email"), fd.get("password")) : await S.store.signIn(fd.get("email"), fd.get("password"));
      demarrer();
    } catch (e) { vueConnexion(e.message); }
  });
}

function vueFoyer(erreur = "") {
  $("#app").innerHTML = `
  <main class="ecran-centre">
    <h1>Votre foyer</h1>
    <p class="sous">Le premier crée le foyer, le second le rejoint avec le code d'invitation.</p>
    <form id="f-creer" class="form">
      <label>Ton prénom<input name="prenom" required></label>
      <label>Nom du foyer<input name="nom" value="Maison"></label>
      <button class="btn">Créer le foyer</button>
    </form>
    <div class="ou">ou</div>
    <form id="f-rejoindre" class="form">
      <label>Ton prénom<input name="prenom" required></label>
      <label>Code d'invitation<input name="code" required maxlength="6" autocapitalize="characters" class="code"></label>
      <button class="btn btn-sec">Rejoindre le foyer</button>
    </form>
    ${erreur ? `<p class="erreur">${esc(erreur)}</p>` : ""}
  </main>`;
  $("#f-creer").addEventListener("submit", async (ev) => {
    ev.preventDefault(); const fd = new FormData(ev.target);
    try { await S.store.createFoyer(fd.get("nom"), fd.get("prenom")); demarrer(); } catch (e) { vueFoyer(e.message); }
  });
  $("#f-rejoindre").addEventListener("submit", async (ev) => {
    ev.preventDefault(); const fd = new FormData(ev.target);
    try { await S.store.joinFoyer(fd.get("code"), fd.get("prenom")); demarrer(); } catch (e) { vueFoyer(e.message); }
  });
}

// ------------------------------------------------------------------
//  Rendu principal
// ------------------------------------------------------------------
function rendre() {
  const nbAlertes = S.produits.filter((p) => estBas(p) || bientotPerime(p)).length;
  const vues = { stock: vueStock, racheter: vueRacheter, drive: vueDrive, reglages: vueReglages };
  $("#app").innerHTML = `
    ${S.store.mode === "demo" ? `<div class="bandeau-demo">Mode démo : données sur ce téléphone uniquement</div>` : ""}
    <main class="contenu">${vues[S.onglet]()}</main>
    <nav class="barre-onglets" aria-label="Navigation">
      ${onglet("stock", "Stock", icStock)}
      ${onglet("racheter", "À racheter", icAlerte, nbAlertes)}
      ${onglet("drive", "Drive", icPanier)}
      ${onglet("reglages", "Réglages", icReglages)}
    </nav>
`;
  brancher();
}

const onglet = (id, label, ic, n = 0) => `
  <button class="onglet ${S.onglet === id ? "actif" : ""}" data-onglet="${id}" ${S.onglet === id ? 'aria-current="page"' : ""}>
    ${ic}<span>${label}</span>${n ? `<b class="pastille">${n}</b>` : ""}
  </button>`;

// ---------- Onglet Stock ----------
function vueStock() {
  const nbBas = S.produits.filter(estBas).length;
  const emp = S.emplacements.find((e) => e.id === S.filtre);
  const nb = S.produits.filter((p) => S.filtre === "tout" || p.emplacement_id === S.filtre).length;
  return `
  <header class="entete entete-action">
    <div><h1>${emp ? esc(emp.nom) : "Tout le stock"}</h1>
    <p class="compte">${nb} produit${nb > 1 ? "s" : ""}</p></div>
    <button class="btn-ajout" id="btn-ajout">${icPlus}<span>Ajouter</span></button>
  </header>
  ${nbBas ? `<button class="alerte" data-onglet="racheter">${icAlerte}<span>${nbBas} produit${nbBas > 1 ? "s" : ""} à toujours avoir ${nbBas > 1 ? "sont" : "est"} sous le seuil</span></button>` : ""}
  <div class="filtres">
    <button class="puce ${S.filtre === "tout" ? "active" : ""}" data-filtre="tout">Tout</button>
    ${S.emplacements.map((e) => `<button class="puce t-${e.type} ${S.filtre === e.id ? "active" : ""}" data-filtre="${e.id}">${e.icone} ${esc(e.nom)}</button>`).join("")}
  </div>
  <label class="recherche">${icLoupe}<input id="recherche" type="search" placeholder="Chercher un produit" value="${esc(S.recherche)}" aria-label="Chercher un produit"></label>
  <div id="liste-stock">${listeStock()}</div>`;
}

function listeStock() {
  const q = S.recherche.trim().toLowerCase();
  const liste = S.produits.filter((p) => (S.filtre === "tout" || p.emplacement_id === S.filtre) && (!q || p.nom.toLowerCase().includes(q)));
  const groupes = {};
  for (const p of liste.sort((a, b) => a.nom.localeCompare(b.nom, "fr"))) (groupes[p.categorie] ??= []).push(p);
  const ordre = Object.keys(groupes).sort((a, b) => CATEGORIES.indexOf(a) - CATEGORIES.indexOf(b));
  return `
  ${ordre.length ? ordre.map((c) => `
    <section class="groupe">
      <h2>${esc(c)}</h2>
      <ul class="liste">${groupes[c].map(ligneProduit).join("")}</ul>
    </section>`).join("") : `
    <div class="vide">
      <p>${q ? `Aucun produit ne correspond à « ${esc(S.recherche)} ».` : "Rien ici pour l'instant."}</p>
      ${q ? "" : `<button class="btn" id="btn-ajout-vide">Ajouter un produit</button>`}
    </div>`}`;
}

function ligneProduit(p) {
  const e = S.emplacements.find((x) => x.id === p.emplacement_id);
  const j = joursAvant(p.peremption);
  const tags = [];
  if (estBas(p)) tags.push(`<span class="tag tag-bas">Sous le seuil (${fmtQ(p.seuil_min)})</span>`);
  if (j !== null && j < 0) tags.push(`<span class="tag tag-bas">Périmé</span>`);
  else if (j !== null && j <= 3) tags.push(`<span class="tag tag-date">${j === 0 ? "À consommer aujourd'hui" : `À consommer sous ${j} j`}</span>`);
  if (p.toujours_stock && !estBas(p)) tags.push(`<span class="tag">Toujours en stock</span>`);
  return `
  <li class="produit t-${e?.type ?? "autre"} ${estBas(p) ? "est-bas" : ""}" data-id="${p.id}">
    <button class="produit-info" data-edit="${p.id}">
      <span class="nom">${esc(p.nom)}</span>
      <span class="meta">${S.filtre === "tout" && e ? `${e.icone} ${esc(e.nom)}` : ""}${tags.join("")}</span>
    </button>
    <div class="compteur">
      <button class="moins" data-delta="-1" data-id="${p.id}" aria-label="Retirer ${esc(p.nom)}">−</button>
      <output><b>${fmtQ(p.quantite)}</b><small>${esc(p.unite)}</small></output>
      <button class="plus" data-delta="1" data-id="${p.id}" aria-label="Ajouter ${esc(p.nom)}">+</button>
    </div>
  </li>`;
}

// ---------- Onglet À racheter ----------
function vueRacheter() {
  const bas = S.produits.filter(estBas).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  const dates = S.produits.filter(bientotPerime).sort((a, b) => a.peremption.localeCompare(b.peremption));
  return `
  <header class="entete"><h1>À racheter</h1>
    <p class="compte">Les produits marqués « toujours en stock » passés sous leur seuil.</p></header>
  ${bas.length ? `<ul class="liste">${bas.map(ligneProduit).join("")}</ul>
    <button class="btn" id="btn-copier-liste">Copier la liste</button>`
    : `<div class="vide"><p>Rien à racheter : tous les produits essentiels sont au-dessus de leur seuil.</p></div>`}
  <section class="groupe"><h2>À consommer vite</h2>
    ${dates.length ? `<ul class="liste">${dates.map(ligneProduit).join("")}</ul>` : `<p class="discret">Aucun produit ne périme dans les 3 jours.</p>`}
  </section>`;
}

// ---------- Onglet Drive ----------
function vueDrive() {
  const f = S.foyer;
  return `
  <header class="entete"><h1>Préparer un drive</h1>
    <p class="compte">Claude compose les repas et remplit ton panier Carrefour en tenant compte du stock.</p></header>
  <form id="f-drive" class="form">
    <div class="duo">
      <label>Personnes<input name="personnes" type="number" min="1" max="12" value="${f.nb_personnes}" inputmode="numeric"></label>
      <label>Repas à prévoir<input name="repas" type="number" min="1" max="30" value="5" inputmode="numeric"></label>
    </div>
    <label>Budget max (€)<input name="budget" type="number" min="5" step="1" value="${+f.budget_drive}" inputmode="decimal"></label>
    <label><span>Aliments refusés <small>séparés par des virgules</small></span>
      <input name="refuses" value="${esc((f.aliments_refuses || []).join(", "))}" placeholder="ex : champignons, olives"></label>
    <label><span>Envies ou contraintes <small>facultatif</small></span>
      <textarea name="envies" rows="2" placeholder="ex : repas rapides le soir, un plat à emporter au boulot"></textarea></label>
    <button class="btn">Copier la demande pour Claude</button>
    <a class="btn btn-sec" href="https://claude.ai/new" target="_blank" rel="noopener">Ouvrir Claude</a>
  </form>
  <p class="discret">La demande copiée contient votre stock actuel, ce qui est sous le seuil et vos préférences. Colle-la dans Claude : il propose les recettes, vérifie les prix et remplit le panier du Drive. Il ne reste qu'à choisir le créneau et payer.</p>`;
}

function texteDrive(fd) {
  const nomEmp = (id) => S.emplacements.find((e) => e.id === id)?.nom ?? "Sans emplacement";
  const stock = S.produits.filter((p) => +p.quantite > 0)
    .map((p) => `- ${p.nom} : ${fmtQ(p.quantite)} ${p.unite} (${nomEmp(p.emplacement_id)}${p.peremption ? `, à consommer avant le ${new Date(p.peremption).toLocaleDateString("fr-FR")}` : ""})`);
  const bas = S.produits.filter(estBas).map((p) => `- ${p.nom} (reste ${fmtQ(p.quantite)} ${p.unite}, seuil ${fmtQ(p.seuil_min)})`);
  return [
    `Prépare mon drive Carrefour (Carrefour Market Rive-de-Gier) avec l'appli Stock Maison.`,
    ``,
    `- Personnes : ${fd.get("personnes")}`,
    `- Repas à prévoir : ${fd.get("repas")}`,
    `- Budget maximum : ${fd.get("budget")} €`,
    `- Aliments refusés : ${fd.get("refuses") || "aucun"}`,
    fd.get("envies") ? `- Envies / contraintes : ${fd.get("envies")}` : null,
    ``,
    `Produits « toujours en stock » à racheter :`,
    ...(bas.length ? bas : ["- aucun"]),
    ``,
    `Ce que j'ai déjà (à utiliser en priorité, ne pas racheter) :`,
    ...stock,
    ``,
    `Propose les recettes, puis remplis mon panier sans dépasser le budget.`,
  ].filter((l) => l !== null).join("\n");
}

// ---------- Onglet Réglages ----------
function vueReglages() {
  const f = S.foyer;
  const notifEtat = !("Notification" in window) ? "indispo" : Notification.permission;
  return `
  <header class="entete"><h1>Réglages</h1></header>
  ${S.store.mode === "supabase" ? `
  <section class="groupe"><h2>Partager avec ta copine</h2>
    <p class="discret">Elle installe l'appli, crée son compte, puis choisit « Rejoindre le foyer » avec ce code :</p>
    <p class="code-invit">${esc(f.code_invit)}</p>
  </section>` : `
  <section class="groupe"><h2>Mode démo</h2>
    <p class="discret">Les données restent sur ce téléphone. Pour partager le stock, renseigne Supabase dans <code>config.js</code> (voir le guide d'installation).</p>
  </section>`}

  <section class="groupe"><h2>Emplacements</h2>
    <ul class="liste">${S.emplacements.map((e) => `
      <li class="ligne-emp t-${e.type}"><span>${e.icone} ${esc(e.nom)}</span>
        <button class="lien" data-emp="${e.id}">Modifier</button></li>`).join("")}
    </ul>
    <button class="btn btn-sec" data-emp="nouveau">Ajouter un emplacement</button>
  </section>

  <section class="groupe"><h2>Préférences pour les drives</h2>
    <form id="f-prefs" class="form">
      <div class="duo">
        <label>Personnes<input name="nb_personnes" type="number" min="1" value="${f.nb_personnes}"></label>
        <label>Budget (€)<input name="budget_drive" type="number" min="5" value="${+f.budget_drive}"></label>
      </div>
      <label>Aliments refusés<input name="aliments_refuses" value="${esc((f.aliments_refuses || []).join(", "))}" placeholder="ex : champignons, olives"></label>
      <button class="btn">Enregistrer les préférences</button>
    </form>
  </section>

  <section class="groupe"><h2>Alertes</h2>
    ${notifEtat === "granted" ? `<p class="discret">Alertes activées : une notification apparaît quand un produit passe sous son seuil, et le nombre d'alertes s'affiche sur l'icône.</p>`
      : notifEtat === "denied" ? `<p class="discret">Les notifications sont bloquées. Réactive-les dans Réglages iPhone › Notifications › Stock.</p>`
      : notifEtat === "indispo" ? `<p class="discret">Pour recevoir les alertes, ajoute d'abord l'appli à l'écran d'accueil depuis Safari (bouton Partager › Sur l'écran d'accueil).</p>`
      : `<button class="btn btn-sec" id="btn-notif">Activer les alertes</button>`}
  </section>

  <section class="groupe"><h2>Compte</h2>
    <p class="discret">${esc(S.user?.email ?? "")}</p>
    <button class="btn btn-danger" id="btn-deco">${S.store.mode === "demo" ? "Réinitialiser la démo" : "Se déconnecter"}</button>
  </section>`;
}

// ------------------------------------------------------------------
//  Événements
// ------------------------------------------------------------------
function brancher() {
  const app = $("#app");
  app.onclick = async (ev) => {
    const t = ev.target.closest("button, a");
    if (!t) return;
    if (t.dataset.onglet) { S.onglet = t.dataset.onglet; rendre(); scrollTo(0, 0); return; }
    if (t.dataset.filtre) { S.filtre = t.dataset.filtre; rendre(); return; }
    if (t.dataset.delta) return changerQuantite(t.dataset.id, +t.dataset.delta);
    if (t.dataset.edit) return feuilleProduit(S.produits.find((p) => p.id === t.dataset.edit));
    if (t.dataset.emp) return feuilleEmplacement(t.dataset.emp === "nouveau" ? null : S.emplacements.find((e) => e.id === t.dataset.emp));
    if (t.id === "btn-ajout" || t.id === "btn-ajout-vide") return feuilleProduit(null);
    if (t.id === "btn-deco") return S.store.signOut();
    if (t.id === "btn-notif") { await Notification.requestPermission(); rendre(); return; }
    if (t.id === "btn-copier-liste") {
      const txt = S.produits.filter(estBas).map((p) => `- ${p.nom}`).join("\n");
      return copier(txt, "Liste copiée");
    }
  };
  const r = $("#recherche");
  if (r) r.oninput = debounce(() => { S.recherche = r.value; $("#liste-stock").innerHTML = listeStock(); }, 120);

  const fd = $("#f-drive");
  if (fd) fd.onsubmit = (ev) => { ev.preventDefault(); copier(texteDrive(new FormData(fd)), "Demande copiée : colle-la dans Claude"); };

  const fp = $("#f-prefs");
  if (fp) fp.onsubmit = async (ev) => {
    ev.preventDefault(); const d = new FormData(fp);
    S.foyer = await S.store.updateFoyer({
      nb_personnes: +d.get("nb_personnes"), budget_drive: +d.get("budget_drive"),
      aliments_refuses: d.get("aliments_refuses").split(",").map((s) => s.trim()).filter(Boolean),
    });
    toast("Préférences enregistrées");
  };
}

async function changerQuantite(id, sens) {
  const p = S.produits.find((x) => x.id === id);
  if (!p) return;
  const q = Math.max(0, +(+p.quantite + sens * pas(p.unite)).toFixed(2));
  p.quantite = q;           // mise à jour immédiate à l'écran
  verifierAlertes(); rendre();
  navigator.vibrate?.(8);
  try { await S.store.setQuantite(id, q); } catch (e) { toast(e.message); charger(); }
}

async function copier(txt, msg) {
  try { await navigator.clipboard.writeText(txt); toast(msg); }
  catch { prompt("Copie ce texte :", txt); }
}

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 2600);
}

// ------------------------------------------------------------------
//  Feuilles (ajout / modification)
// ------------------------------------------------------------------
function ouvrirFeuille(html, onSubmit, onDelete) {
  const sh = $("#sheet"), bd = $("#sheet-backdrop");
  sh.innerHTML = `<div class="poignee" aria-hidden="true"></div>${html}`;
  sh.hidden = bd.hidden = false;
  requestAnimationFrame(() => sh.classList.add("ouverte"));
  const fermer = () => { sh.classList.remove("ouverte"); setTimeout(() => (sh.hidden = bd.hidden = true), 200); };
  bd.onclick = fermer;
  $("[data-fermer]", sh).onclick = fermer;
  $("form", sh).onsubmit = async (ev) => {
    ev.preventDefault();
    try { await onSubmit(new FormData(ev.target)); fermer(); await charger(); } catch (e) { toast(e.message); }
  };
  const del = $("[data-supprimer]", sh);
  if (del) del.onclick = async () => { try { if (await onDelete()) { fermer(); await charger(); } } catch (e) { toast(e.message); } };
  const premier = $("input", sh); if (premier && !premier.value) setTimeout(() => premier.focus(), 220);
}

function feuilleProduit(p) {
  const n = !p;
  p = p || { nom: "", categorie: "Autre", quantite: 1, unite: "pièce", seuil_min: 0, toujours_stock: false, peremption: "",
    emplacement_id: S.filtre !== "tout" ? S.filtre : S.emplacements[0]?.id };
  ouvrirFeuille(`
    <form class="form">
      <div class="feuille-tete"><h2>${n ? "Ajouter un produit" : "Modifier le produit"}</h2><button type="button" class="lien" data-fermer>Fermer</button></div>
      <label>Nom<input name="nom" required value="${esc(p.nom)}" placeholder="ex : Yaourts nature" autocomplete="off"></label>
      <label>Emplacement<select name="emplacement_id">${S.emplacements.map((e) => `<option value="${e.id}" ${e.id === p.emplacement_id ? "selected" : ""}>${e.icone} ${esc(e.nom)}</option>`).join("")}</select></label>
      <label>Catégorie<select name="categorie">${CATEGORIES.map((c) => `<option ${c === p.categorie ? "selected" : ""}>${c}</option>`).join("")}</select></label>
      <div class="duo">
        <label>Quantité<input name="quantite" type="number" step="any" min="0" value="${+p.quantite}" inputmode="decimal"></label>
        <label>Unité<select name="unite">${UNITES.map((u) => `<option ${u === p.unite ? "selected" : ""}>${u}</option>`).join("")}</select></label>
      </div>
      <label class="interrupteur"><input type="checkbox" name="toujours_stock" ${p.toujours_stock ? "checked" : ""}>
        <span>Toujours en avoir<small>Alerte quand la quantité descend au seuil</small></span></label>
      <label class="champ-seuil"><span>Seuil d'alerte <small>alerte à partir de cette quantité</small></span><input name="seuil_min" type="number" step="any" min="0" value="${+p.seuil_min}" inputmode="decimal"></label>
      <label><span>À consommer avant <small>facultatif</small></span><input name="peremption" type="date" value="${p.peremption || ""}"></label>
      <button class="btn">${n ? "Ajouter au stock" : "Enregistrer"}</button>
      ${n ? "" : `<button type="button" class="btn btn-danger" data-supprimer>Supprimer le produit</button>`}
    </form>`,
    async (d) => S.store.saveProduit({
      ...(n ? {} : { id: p.id }),
      nom: d.get("nom").trim(), emplacement_id: d.get("emplacement_id") || null, categorie: d.get("categorie"),
      quantite: +d.get("quantite") || 0, unite: d.get("unite"), seuil_min: +d.get("seuil_min") || 0,
      toujours_stock: d.get("toujours_stock") === "on", peremption: d.get("peremption") || null,
    }),
    async () => { if (!confirm(`Supprimer « ${p.nom} » ?`)) return false; await S.store.deleteProduit(p.id); toast("Produit supprimé"); return true; });
}

function feuilleEmplacement(e) {
  const n = !e;
  e = e || { nom: "", type: "placard", icone: "📦" };
  ouvrirFeuille(`
    <form class="form">
      <div class="feuille-tete"><h2>${n ? "Ajouter un emplacement" : "Modifier l'emplacement"}</h2><button type="button" class="lien" data-fermer>Fermer</button></div>
      <label>Nom<input name="nom" required value="${esc(e.nom)}" placeholder="ex : Cellier"></label>
      <label>Type<select name="type">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${k === e.type ? "selected" : ""}>${v}</option>`).join("")}</select></label>
      <fieldset class="icones"><legend>Icône</legend>${ICONES.map((i) => `<label><input type="radio" name="icone" value="${i}" ${i === e.icone ? "checked" : ""}><span>${i}</span></label>`).join("")}</fieldset>
      <button class="btn">${n ? "Ajouter l'emplacement" : "Enregistrer"}</button>
      ${n ? "" : `<button type="button" class="btn btn-danger" data-supprimer>Supprimer l'emplacement</button>`}
    </form>`,
    async (d) => S.store.saveEmplacement({ ...(n ? {} : { id: e.id }), nom: d.get("nom").trim(), type: d.get("type"), icone: d.get("icone") || "📦" }),
    async () => {
      const nb = S.produits.filter((p) => p.emplacement_id === e.id).length;
      if (!confirm(`Supprimer « ${e.nom} » ?${nb ? ` Ses ${nb} produits resteront dans le stock, sans emplacement.` : ""}`)) return false;
      await S.store.deleteEmplacement(e.id); if (S.filtre === e.id) S.filtre = "tout"; return true;
    });
}

// ------------------------------------------------------------------
//  Icônes
// ------------------------------------------------------------------
const svg = (p) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const icStock = svg('<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M5 9.5h14M8.5 5.5v1.5M8.5 12.5v3"/>');
const icAlerte = svg('<path d="M12 3.5 2.8 19.5h18.4z"/><path d="M12 10v4M12 17h.01"/>');
const icPanier = svg('<path d="M3 4h2.2l2.3 11h10.8l2-8H6.3"/><circle cx="9" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>');
const icReglages = svg('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>');
const icPlus = svg('<path d="M12 5v14M5 12h14"/>');
const icLoupe = svg('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>');
const logoSVG = () => `<svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true"><rect x="14" y="4" width="36" height="56" rx="7" fill="var(--frigo)"/><rect x="14" y="4" width="36" height="20" rx="7" fill="var(--congel)"/><rect x="14" y="17" width="36" height="7" fill="var(--congel)"/><path d="M20 12v5M20 31v9" stroke="var(--papier)" stroke-width="3" stroke-linecap="round"/></svg>`;

demarrer();
