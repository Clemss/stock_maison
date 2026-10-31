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
  emplacements: [], produits: [], recettes: [],
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
  [S.emplacements, S.produits, S.foyer, S.recettes] = await Promise.all([S.store.listEmplacements(), S.store.listProduits(), S.store.getFoyer(),
    S.store.listRecettes().then((r) => { S.recettesErreur = null; return r; }).catch((e) => { S.recettesErreur = e.message; return []; })]);
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
  const vues = { stock: vueStock, racheter: vueRacheter, recettes: vueRecettes, drive: vueDrive, reglages: vueReglages };
  $("#app").innerHTML = `
    ${S.store.mode === "demo" ? `<div class="bandeau-demo">Mode démo : données sur ce téléphone uniquement</div>` : ""}
    <main class="contenu">${vues[S.onglet]()}</main>
    <nav class="barre-onglets" aria-label="Navigation">
      ${onglet("stock", "Stock", icStock)}
      ${onglet("racheter", "À racheter", icAlerte, nbAlertes)}
      ${onglet("recettes", "Recettes", icRecette)}
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
    S.recettes.length ? `` : null,
    S.recettes.length ? `Recettes déjà enregistrées dans l'appli (à varier) : ${S.recettes.map((r) => r.nom).join(", ")}` : null,
    ``,
    `Propose les recettes, enregistre-les dans l'appli Stock Maison, puis remplis mon panier sans dépasser le budget.`,
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
    if (t.dataset.recette) return feuilleRecette(S.recettes.find((r) => r.id === t.dataset.recette));
    if (t.id === "btn-ajout-recette") return feuilleEditionRecette(null);
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
    try { if ((await onSubmit(new FormData(ev.target), ev.submitter)) === "garder") return; fermer(); await charger(); } catch (e) { toast(e.message); }
  };
  const del = $("[data-supprimer]", sh);
  if (del) del.onclick = async () => { try { if (await onDelete()) { fermer(); await charger(); } } catch (e) { toast(e.message); } };
  const premier = $("input:not([data-pas-focus])", sh); if (premier && !premier.value) setTimeout(() => premier.focus(), 220);
  sh.scrollTop = 0;
  return { sh, fermer };
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
//  Recettes
// ------------------------------------------------------------------
const norm = (t) => String(t ?? "").toLowerCase().replace(/œ/g, "oe").normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean).map((m) => (m.length > 3 ? m.replace(/[sx]$/, "") : m)).join(" ");
const UNITES_RECETTE = { g: "g", gr: "g", gramme: "g", grammes: "g", kg: "kg", ml: "mL", cl: "cl", l: "L", litre: "L", litres: "L",
  piece: "pièce", pieces: "pièce", "pièce": "pièce", "pièces": "pièce", paquet: "paquet", paquets: "paquet", boite: "boîte", boites: "boîte",
  "boîte": "boîte", "boîtes": "boîte", pot: "pot", pots: "pot", sachet: "sachet", sachets: "sachet", bouteille: "bouteille", bouteilles: "bouteille",
  tranche: "tranche", tranches: "tranche", gousse: "gousse", gousses: "gousse", cs: "c. à s.", cc: "c. à c." };

// Convertit une quantité d'une unité vers une autre (null si impossible)
function convertir(q, de, vers) {
  if (q == null) return null;
  if ((de || "pièce") === (vers || "pièce")) return +q;
  const base = { g: ["g", 1], kg: ["g", 1000], mL: ["mL", 1], cl: ["mL", 10], L: ["mL", 1000] };
  const a = base[de], b = base[vers];
  return a && b && a[0] === b[0] ? (q * a[1]) / b[1] : null;
}

function produitPour(ing) {
  const lie = ing.produit_id && S.produits.find((p) => p.id === ing.produit_id);
  if (lie) return lie;
  const n = norm(ing.nom);
  if (!n) return null;
  const candidats = S.produits.filter((p) => { const m = norm(p.nom); return m === n || m.startsWith(n + " ") || n.startsWith(m + " ") || m.includes(" " + n) || m.split(" ")[0] === n.split(" ")[0]; });
  return candidats.sort((a, b) => (+b.quantite > 0) - (+a.quantite > 0) || (norm(a.nom) === n ? -1 : 1))[0] || null;
}

// État d'un ingrédient : ok | peu | inconnu | manque
function etatIngredient(ing, facteur = 1) {
  const p = produitPour(ing);
  if (!p || +p.quantite <= 0) return { etat: "manque", p };
  const besoin = convertir(ing.quantite == null ? null : ing.quantite * facteur, ing.unite, p.unite);
  if (besoin == null) return { etat: "ok", p };
  return { etat: +p.quantite >= besoin - 1e-9 ? "ok" : "peu", p, besoin };
}

function bilanRecette(r) {
  // Les ingrédients sans quantité (sel, poivre, huile…) ne bloquent pas une recette
  const etats = r.ingredients.filter((i) => i.quantite != null).map((i) => ({ i, ...etatIngredient(i) }));
  const ok = etats.filter((e) => e.etat === "ok").length;
  return { etats, ok, total: etats.length, manquants: etats.filter((e) => e.etat !== "ok") };
}

function vueRecettes() {
  if (S.recettesErreur) return `
    <header class="entete"><h1>Recettes</h1></header>
    <div class="vide"><p>Les recettes ne sont pas encore activées dans la base de données. Relance le fichier <b>supabase/schema.sql</b> dans le SQL Editor de Supabase, puis rouvre l'appli.</p></div>`;
  const liste = S.recettes.map((r) => ({ r, b: bilanRecette(r) }))
    .sort((x, y) => (y.b.ok / (y.b.total || 1)) - (x.b.ok / (x.b.total || 1)) || x.r.nom.localeCompare(y.r.nom, "fr"));
  const faisables = liste.filter((x) => x.b.total && x.b.ok === x.b.total);
  const autres = liste.filter((x) => !(x.b.total && x.b.ok === x.b.total));
  const carte = ({ r, b }) => `
    <li><button class="recette" data-recette="${r.id}">
      <span class="nom">${esc(r.nom)}</span>
      <span class="meta">${[r.temps_min ? `${r.temps_min} min` : "", `${r.portions} pers.`].filter(Boolean).join(", ")}</span>
      <span class="dispo">${b.total ? (b.ok === b.total ? `<span class="tag tag-ok">Tout est en stock</span>`
        : `<span class="manque">Manque : ${b.manquants.map((m) => esc(m.i.nom.toLowerCase())).join(", ")}</span>`) : ""}</span>
      ${b.total ? `<span class="jauge" style="--pc:${Math.round((b.ok / b.total) * 100)}%" aria-label="${b.ok} ingrédients sur ${b.total} en stock"></span>` : ""}
    </button></li>`;
  return `
  <header class="entete entete-action">
    <div><h1>Recettes</h1><p class="compte">${S.recettes.length} recette${S.recettes.length > 1 ? "s" : ""}, triées selon ce que vous avez</p></div>
    <button class="btn-ajout" id="btn-ajout-recette">${icPlus}<span>Ajouter</span></button>
  </header>
  ${!liste.length ? `<div class="vide"><p>Aucune recette pour l'instant. Celles de tes drives s'ajouteront ici, ou ajoute les tiennes.</p></div>` : ""}
  ${faisables.length ? `<section class="groupe"><h2>Faisables avec le stock</h2><ul class="liste-recettes">${faisables.map(carte).join("")}</ul></section>` : ""}
  ${autres.length ? `<section class="groupe"><h2>${faisables.length ? "Il manque quelque chose" : "Toutes les recettes"}</h2><ul class="liste-recettes">${autres.map(carte).join("")}</ul></section>` : ""}`;
}

function ligneIngredient(ing, facteur) {
  const { etat, p } = etatIngredient(ing, facteur);
  const q = ing.quantite == null ? "" : `${fmtQ(+(ing.quantite * facteur).toFixed(2))} ${ing.unite && ing.unite !== "pièce" ? esc(ing.unite) : ""}`;
  if (ing.quantite == null && etat === "manque") return `<li class="ing ing-base"><span class="point" aria-hidden="true"></span><span class="ing-nom">${esc(ing.nom)}</span><small>Basique, non suivi</small></li>`;
  const info = etat === "manque" ? "Pas en stock" : `${etat === "peu" ? "Pas assez" : "En stock"} : ${fmtQ(p.quantite)} ${esc(p.unite)}`;
  return `<li class="ing ing-${etat}"><span class="point" aria-hidden="true"></span><span class="ing-nom"><b>${q.trim()}</b> ${esc(ing.nom)}</span><small>${info}</small></li>`;
}

function feuilleRecette(r, portions = r.portions) {
  const f = portions / r.portions;
  const etapes = (r.etapes || "").split("\n").map((e) => e.trim()).filter(Boolean);
  const { sh } = ouvrirFeuille(`
    <form class="form">
      <div class="feuille-tete"><h2>${esc(r.nom)}</h2><button type="button" class="lien" data-fermer>Fermer</button></div>
      <p class="discret sans-marge">${[r.temps_min ? `${r.temps_min} min` : "", r.nb_fois ? `cuisinée ${r.nb_fois} fois, la dernière le ${new Date(r.derniere_fois).toLocaleDateString("fr-FR")}` : "jamais cuisinée"].filter(Boolean).join(", ")}</p>
      <div class="portions"><span>Portions</span>
        <div class="compteur"><button type="button" data-portions="-1" aria-label="Moins de portions">−</button><output><b>${portions}</b></output><button type="button" data-portions="1" aria-label="Plus de portions">+</button></div>
      </div>
      <h3>Ingrédients</h3>
      <ul class="ingredients">${r.ingredients.map((i) => ligneIngredient(i, f)).join("")}</ul>
      ${etapes.length ? `<h3>Préparation</h3><ol class="etapes">${etapes.map((e) => `<li>${esc(e)}</li>`).join("")}</ol>` : ""}
      <button class="btn">J'ai cuisiné cette recette</button>
      <button type="button" class="btn btn-sec" data-modifier>Modifier la recette</button>
      <button type="button" class="btn btn-danger" data-supprimer>Supprimer la recette</button>
    </form>`,
    async () => { feuilleCuisine(r, portions); return "garder"; },
    async () => { if (!confirm(`Supprimer la recette « ${r.nom} » ?`)) return false; await S.store.deleteRecette(r.id); toast("Recette supprimée"); return true; });
  sh.querySelectorAll("[data-portions]").forEach((b) => (b.onclick = () => feuilleRecette(r, Math.max(1, portions + +b.dataset.portions))));
  $("[data-modifier]", sh).onclick = () => feuilleEditionRecette(r);
}

// Après avoir cuisiné : on propose quoi retirer du stock, modifiable
function feuilleCuisine(r, portions) {
  const f = portions / r.portions;
  const produitsTries = [...S.produits].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  const suggestion = (ing, p) => {
    if (!p) return 0;
    const q = convertir(ing.quantite == null ? null : ing.quantite * f, ing.unite, p.unite);
    return q == null ? 0 : Math.min(+p.quantite, +q.toFixed(2));
  };
  const lignes = r.ingredients.map((ing, n) => {
    const p = produitPour(ing);
    return `
    <li class="retrait" data-n="${n}">
      <div class="retrait-tete"><b>${esc(ing.nom)}</b>${ing.quantite != null ? `<small>recette : ${fmtQ(+(ing.quantite * f).toFixed(2))} ${esc(ing.unite || "")}</small>` : ""}</div>
      <div class="retrait-champs">
        <select name="produit-${n}" aria-label="Produit du stock pour ${esc(ing.nom)}">
          <option value="">Pas dans le stock</option>
          ${produitsTries.map((x) => `<option value="${x.id}" ${p?.id === x.id ? "selected" : ""}>${esc(x.nom)} (${fmtQ(x.quantite)} ${esc(x.unite)})</option>`).join("")}
        </select>
        <label class="retrait-q"><input name="retrait-${n}" type="number" step="any" min="0" value="${suggestion(ing, p)}" inputmode="decimal" data-pas-focus aria-label="Quantité à retirer"><span>${esc(p?.unite ?? "")}</span></label>
      </div>
    </li>`;
  }).join("");
  const { sh } = ouvrirFeuille(`
    <form class="form">
      <div class="feuille-tete"><h2>Retirer du stock</h2><button type="button" class="lien" data-fermer>Annuler</button></div>
      <p class="discret sans-marge">${esc(r.nom)}, ${portions} portion${portions > 1 ? "s" : ""}. Vérifie les quantités utilisées : elles seront retirées du stock.</p>
      <ul class="retraits">${lignes}</ul>
      <button class="btn">Retirer du stock</button>
    </form>`,
    async (d) => {
      const retraits = r.ingredients.map((ing, n) => ({ ingredient_id: ing.id, produit_id: d.get(`produit-${n}`), retrait: +d.get(`retrait-${n}`) || 0 }))
        .filter((t) => t.produit_id);
      await S.store.cuisiner(r.id, retraits);
      const n = retraits.filter((t) => t.retrait > 0).length;
      toast(n ? `Stock mis à jour : ${n} produit${n > 1 ? "s" : ""}` : "Recette notée comme cuisinée");
    });
  sh.querySelectorAll("select[name^=produit-]").forEach((sel) => (sel.onchange = () => {
    const n = sel.name.split("-")[1], ing = r.ingredients[n], p = S.produits.find((x) => x.id === sel.value);
    const li = sel.closest(".retrait");
    $("input", li).value = suggestion(ing, p);
    $(".retrait-q span", li).textContent = p?.unite ?? "";
  }));
}

// Texte « 250 g pâtes » <-> ingrédient
function lireIngredient(ligne) {
  const t = ligne.trim().replace(/^[-•*]\s*/, "");
  if (!t) return null;
  const m = t.match(/^(\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!m) return { nom: t, quantite: null, unite: null };
  let q = m[1].includes("/") ? m[1].split("/").map(Number).reduce((a, b) => a / b) : +m[1].replace(",", ".");
  let reste = m[2];
  const mots = reste.split(/\s+/);
  const u = UNITES_RECETTE[(mots[0] || "").toLowerCase().replace(/\.$/, "")];
  let unite = "pièce";
  if (u) { unite = u; reste = mots.slice(1).join(" "); }
  reste = reste.replace(/^(de |d'|d’)/i, "").trim();
  if (unite === "cl") { unite = "mL"; q = q * 10; }
  return { nom: reste ? reste[0].toUpperCase() + reste.slice(1) : t, quantite: q, unite };
}
const ecrireIngredient = (i) => (i.quantite == null ? i.nom : `${fmtQ(i.quantite)}${i.unite && i.unite !== "pièce" ? " " + i.unite : ""} ${i.nom.toLowerCase()}`);

function feuilleEditionRecette(r) {
  const n = !r;
  r = r || { nom: "", portions: S.foyer.nb_personnes || 2, temps_min: "", etapes: "", ingredients: [] };
  ouvrirFeuille(`
    <form class="form">
      <div class="feuille-tete"><h2>${n ? "Ajouter une recette" : "Modifier la recette"}</h2><button type="button" class="lien" data-fermer>Fermer</button></div>
      <label>Nom<input name="nom" required value="${esc(r.nom)}" placeholder="ex : Gratin de pâtes"></label>
      <div class="duo">
        <label>Portions<input name="portions" type="number" min="1" value="${r.portions}" inputmode="numeric"></label>
        <label>Temps (min)<input name="temps_min" type="number" min="0" value="${r.temps_min ?? ""}" inputmode="numeric"></label>
      </div>
      <label><span>Ingrédients <small>un par ligne, ex : 250 g pâtes</small></span>
        <textarea name="ingredients" rows="6" placeholder="250 g pâtes&#10;2 steaks hachés&#10;1 pot sauce tomate">${esc(r.ingredients.map(ecrireIngredient).join("\n"))}</textarea></label>
      <label><span>Préparation <small>une étape par ligne</small></span>
        <textarea name="etapes" rows="5">${esc(r.etapes || "")}</textarea></label>
      <button class="btn">${n ? "Ajouter la recette" : "Enregistrer"}</button>
    </form>`,
    async (d) => {
      const ings = d.get("ingredients").split("\n").map(lireIngredient).filter(Boolean).map((i) => {
        const ancien = r.ingredients.find((a) => norm(a.nom) === norm(i.nom));
        return { ...i, id: ancien?.id, produit_id: ancien?.produit_id ?? null };
      });
      await S.store.saveRecette({ ...(n ? {} : { id: r.id }), nom: d.get("nom").trim(), portions: +d.get("portions") || 1,
        temps_min: +d.get("temps_min") || null, etapes: d.get("etapes").trim() }, ings);
      toast(n ? "Recette ajoutée" : "Recette enregistrée");
    });
}

// ------------------------------------------------------------------
//  Icônes
// ------------------------------------------------------------------
const svg = (p) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const icStock = svg('<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M5 9.5h14M8.5 5.5v1.5M8.5 12.5v3"/>');
const icAlerte = svg('<path d="M12 3.5 2.8 19.5h18.4z"/><path d="M12 10v4M12 17h.01"/>');
const icRecette = svg('<path d="M4 11h16v2a7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7z"/><path d="M2.5 11h19M9 7.5c0-1.5 1-1.5 1-3M13.5 7.5c0-1.5 1-1.5 1-3"/>');
const icPanier = svg('<path d="M3 4h2.2l2.3 11h10.8l2-8H6.3"/><circle cx="9" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>');
const icReglages = svg('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>');
const icPlus = svg('<path d="M12 5v14M5 12h14"/>');
const icLoupe = svg('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>');
const logoSVG = () => `<svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true"><rect x="14" y="4" width="36" height="56" rx="7" fill="var(--frigo)"/><rect x="14" y="4" width="36" height="20" rx="7" fill="var(--congel)"/><rect x="14" y="17" width="36" height="7" fill="var(--congel)"/><path d="M20 12v5M20 31v9" stroke="var(--papier)" stroke-width="3" stroke-linecap="round"/></svg>`;

demarrer();
