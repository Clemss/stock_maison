// Couche de données : Supabase (partagé) ou mode démo (local au téléphone)

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());

// ------------------------------------------------------------------
//  MODE DÉMO — tout est stocké dans le navigateur
// ------------------------------------------------------------------
function demoStore() {
  const KEY = "stock-maison-demo-v1";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} };
  const listeners = new Set();
  const emit = () => listeners.forEach((f) => f());

  let db = load();
  if (!db) {
    const f = uid();
    const E = { frigo: uid(), congel: uid(), garage: uid(), placard: uid() };
    const in3 = new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10);
    const in60 = new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10);
    const P = (nom, emplacement_id, categorie, quantite, unite, seuil_min = 0, toujours_stock = false, peremption = null) =>
      ({ id: uid(), foyer_id: f, nom, emplacement_id, categorie, quantite, unite, seuil_min, toujours_stock, peremption, code_barres: null, note: null, maj_le: new Date().toISOString() });
    db = {
      foyer: { id: f, nom: "Maison", code_invit: "DEMO42", nb_personnes: 2, budget_drive: 50, aliments_refuses: [] },
      emplacements: [
        { id: E.frigo, foyer_id: f, nom: "Frigo", type: "frigo", icone: "🧊", ordre: 1 },
        { id: E.congel, foyer_id: f, nom: "Congélateur du frigo", type: "congelateur", icone: "❄️", ordre: 2 },
        { id: E.garage, foyer_id: f, nom: "Congélateur garage", type: "congelateur", icone: "🥶", ordre: 3 },
        { id: E.placard, foyer_id: f, nom: "Placards cuisine", type: "placard", icone: "🗄️", ordre: 4 },
      ],
      produits: [
        P("Yaourts nature", E.frigo, "Produits laitiers", 2, "pot", 4, true),
        P("Lait demi-écrémé", E.placard, "Boissons", 3, "L", 2, true),
        P("Œufs", E.frigo, "Produits laitiers", 6, "pièce", 4, true),
        P("Beurre doux", E.frigo, "Produits laitiers", 1, "pièce", 1, true),
        P("Jambon blanc", E.frigo, "Viande & poisson", 1, "paquet", 0, false, in3),
        P("Emmental râpé", E.frigo, "Produits laitiers", 1, "sachet"),
        P("Steaks hachés", E.garage, "Viande & poisson", 8, "pièce", 4, true, in60),
        P("Filets de cabillaud", E.garage, "Viande & poisson", 2, "paquet"),
        P("Haricots verts", E.congel, "Surgelés", 1, "sachet"),
        P("Glace vanille", E.congel, "Surgelés", 1, "boîte"),
        P("Pâtes", E.placard, "Épicerie salée", 1500, "g", 500, true),
        P("Riz basmati", E.placard, "Épicerie salée", 400, "g", 500, true),
        P("Sauce tomate", E.placard, "Épicerie salée", 2, "pot"),
        P("Café moulu", E.placard, "Épicerie sucrée", 1, "paquet", 1, true),
      ],
    };
    save();
  }
  if (!db.recettes) {
    const I = (nom, quantite, unite) => ({ id: uid(), nom, quantite, unite, produit_id: null });
    const R = (nom, portions, temps_min, ingredients, etapes) =>
      ({ id: uid(), foyer_id: db.foyer.id, nom, portions, temps_min, etapes, source: "claude", favori: false, derniere_fois: null, nb_fois: 0, ingredients });
    db.recettes = [
      R("Pâtes à la bolognaise", 2, 25, [I("Pâtes", 250, "g"), I("Steaks hachés", 2, "pièce"), I("Sauce tomate", 1, "pot"), I("Oignon", 1, "pièce"), I("Emmental râpé", 0.5, "sachet")],
        "Faire revenir l'oignon émincé.\nAjouter les steaks émiettés, cuire 5 min.\nVerser la sauce tomate, laisser mijoter 10 min.\nCuire les pâtes, servir avec l'emmental."),
      R("Cabillaud, riz et haricots verts", 2, 20, [I("Filets de cabillaud", 1, "paquet"), I("Riz basmati", 150, "g"), I("Haricots verts", 0.5, "sachet"), I("Citron", 1, "pièce")],
        "Cuire le riz.\nCuire les haricots verts 8 min à l'eau bouillante.\nPoêler le cabillaud 3 min par face, arroser de citron."),
      R("Omelette jambon fromage", 2, 10, [I("Œufs", 4, "pièce"), I("Jambon blanc", 1, "paquet"), I("Emmental râpé", 0.25, "sachet")],
        "Battre les œufs, ajouter le jambon coupé et l'emmental.\nCuire à la poêle 4 à 5 min."),
    ];
    save();
  }
  const me = { id: "demo", email: "demo@local" };

  return {
    mode: "demo",
    async session() { return me; },
    async signIn() { return me; },
    async signUp() { return me; },
    async signOut() { if (confirm("Effacer les données de démo et repartir de zéro ?")) { localStorage.removeItem(KEY); location.reload(); } },
    async getFoyer() { return db.foyer; },
    async createFoyer() { return db.foyer; },
    async joinFoyer() { throw new Error("Le partage n'existe pas en mode démo. Configure Supabase d'abord."); },
    async updateFoyer(fields) { Object.assign(db.foyer, fields); save(); emit(); return db.foyer; },
    async listEmplacements() { return [...db.emplacements].sort((a, b) => a.ordre - b.ordre); },
    async saveEmplacement(e) {
      if (e.id) Object.assign(db.emplacements.find((x) => x.id === e.id), e);
      else db.emplacements.push({ ...e, id: uid(), foyer_id: db.foyer.id, ordre: db.emplacements.length + 1 });
      save(); emit();
    },
    async deleteEmplacement(id) {
      db.emplacements = db.emplacements.filter((e) => e.id !== id);
      db.produits.forEach((p) => { if (p.emplacement_id === id) p.emplacement_id = null; });
      save(); emit();
    },
    async listProduits() { return db.produits.map((p) => ({ ...p })); },
    async saveProduit(p) {
      const row = { ...p, maj_le: new Date().toISOString() };
      if (p.id) Object.assign(db.produits.find((x) => x.id === p.id), row);
      else db.produits.push({ ...row, id: uid(), foyer_id: db.foyer.id });
      save(); emit();
    },
    async setQuantite(id, quantite) { const p = db.produits.find((x) => x.id === id); if (p) { p.quantite = quantite; p.maj_le = new Date().toISOString(); save(); } },
    async deleteProduit(id) { db.produits = db.produits.filter((p) => p.id !== id); save(); emit(); },
    async listRecettes() { return JSON.parse(JSON.stringify(db.recettes)); },
    async saveRecette(r, ingredients) {
      const ings = ingredients.map((i) => ({ ...i, id: i.id || uid() }));
      if (r.id) Object.assign(db.recettes.find((x) => x.id === r.id), r, { ingredients: ings });
      else db.recettes.push({ favori: false, derniere_fois: null, nb_fois: 0, source: "manuel", ...r, id: uid(), foyer_id: db.foyer.id, ingredients: ings });
      save(); emit();
    },
    async deleteRecette(id) { db.recettes = db.recettes.filter((r) => r.id !== id); save(); emit(); },
    async cuisiner(recetteId, retraits) {
      const r = db.recettes.find((x) => x.id === recetteId);
      for (const t of retraits) {
        const p = db.produits.find((x) => x.id === t.produit_id);
        if (p) { p.quantite = Math.max(0, +(+p.quantite - t.retrait).toFixed(2)); p.maj_le = new Date().toISOString(); }
        const ing = r?.ingredients.find((i) => i.id === t.ingredient_id);
        if (ing) ing.produit_id = t.produit_id;
      }
      if (r) { r.derniere_fois = new Date().toISOString().slice(0, 10); r.nb_fois = (r.nb_fois || 0) + 1; }
      save(); emit();
    },
    subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb); },
  };
}

// ------------------------------------------------------------------
//  MODE SUPABASE — partagé entre les téléphones du foyer
// ------------------------------------------------------------------
async function supabaseStore(url, key) {
  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm");
  const sb = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
  let foyerId = null;
  const ok = ({ data, error }) => { if (error) throw new Error(traduire(error.message)); return data; };

  return {
    mode: "supabase",
    async session() { const { data } = await sb.auth.getSession(); return data.session?.user ?? null; },
    async signIn(email, password) { return ok(await sb.auth.signInWithPassword({ email, password })).user; },
    async signUp(email, password) {
      const data = ok(await sb.auth.signUp({ email, password }));
      if (!data.session) throw new Error("Compte créé. Confirme ton adresse via le mail reçu, puis connecte-toi.");
      return data.user;
    },
    async signOut() { await sb.auth.signOut(); location.reload(); },
    async getFoyer() {
      const rows = ok(await sb.from("foyers").select("*").limit(1));
      foyerId = rows[0]?.id ?? null;
      return rows[0] ?? null;
    },
    async createFoyer(nom, prenom) { ok(await sb.rpc("creer_foyer", { p_nom: nom, p_prenom: prenom })); return this.getFoyer(); },
    async joinFoyer(code, prenom) { ok(await sb.rpc("rejoindre_foyer", { p_code: code, p_prenom: prenom })); return this.getFoyer(); },
    async updateFoyer(fields) { return ok(await sb.from("foyers").update(fields).eq("id", foyerId).select().single()); },
    async listEmplacements() { return ok(await sb.from("emplacements").select("*").order("ordre")); },
    async saveEmplacement(e) {
      if (e.id) ok(await sb.from("emplacements").update({ nom: e.nom, type: e.type, icone: e.icone }).eq("id", e.id));
      else {
        const n = ok(await sb.from("emplacements").select("id", { count: "exact", head: false })).length;
        ok(await sb.from("emplacements").insert({ ...e, foyer_id: foyerId, ordre: n + 1 }));
      }
    },
    async deleteEmplacement(id) { ok(await sb.from("emplacements").delete().eq("id", id)); },
    async listProduits() { return ok(await sb.from("produits").select("*").order("nom")); },
    async saveProduit(p) {
      const { data: u } = await sb.auth.getUser();
      const row = { ...p, maj_le: new Date().toISOString(), maj_par: u.user?.id };
      if (p.id) ok(await sb.from("produits").update(row).eq("id", p.id));
      else { delete row.id; ok(await sb.from("produits").insert({ ...row, foyer_id: foyerId })); }
    },
    async setQuantite(id, quantite) { ok(await sb.from("produits").update({ quantite, maj_le: new Date().toISOString() }).eq("id", id)); },
    async deleteProduit(id) { ok(await sb.from("produits").delete().eq("id", id)); },
    async listRecettes() {
      const rows = ok(await sb.from("recettes").select("*, recette_ingredients(*)").order("nom"));
      return rows.map(({ recette_ingredients, ...r }) => ({ ...r, ingredients: (recette_ingredients || []).sort((a, b) => a.ordre - b.ordre) }));
    },
    async saveRecette(r, ingredients) {
      let id = r.id;
      const champs = { nom: r.nom, portions: r.portions, temps_min: r.temps_min, etapes: r.etapes };
      if (id) ok(await sb.from("recettes").update(champs).eq("id", id));
      else id = ok(await sb.from("recettes").insert({ ...champs, foyer_id: foyerId, source: "manuel" }).select("id").single()).id;
      ok(await sb.from("recette_ingredients").delete().eq("recette_id", id));
      if (ingredients.length) ok(await sb.from("recette_ingredients").insert(ingredients.map((i, n) =>
        ({ recette_id: id, nom: i.nom, quantite: i.quantite, unite: i.unite, produit_id: i.produit_id || null, ordre: n }))));
    },
    async deleteRecette(id) { ok(await sb.from("recettes").delete().eq("id", id)); },
    async cuisiner(recetteId, retraits) {
      const ids = retraits.map((t) => t.produit_id);
      const actuels = ids.length ? ok(await sb.from("produits").select("id, quantite").in("id", ids)) : [];
      for (const t of retraits) {
        const p = actuels.find((x) => x.id === t.produit_id);
        if (p) ok(await sb.from("produits").update({ quantite: Math.max(0, +(+p.quantite - t.retrait).toFixed(2)), maj_le: new Date().toISOString() }).eq("id", p.id));
        ok(await sb.from("recette_ingredients").update({ produit_id: t.produit_id }).eq("id", t.ingredient_id));
      }
      const r = ok(await sb.from("recettes").select("nb_fois").eq("id", recetteId).single());
      ok(await sb.from("recettes").update({ derniere_fois: new Date().toISOString().slice(0, 10), nb_fois: (r.nb_fois || 0) + 1 }).eq("id", recetteId));
    },
    subscribe(cb) {
      const ch = sb.channel("stock")
        .on("postgres_changes", { event: "*", schema: "public", table: "produits" }, cb)
        .on("postgres_changes", { event: "*", schema: "public", table: "emplacements" }, cb)
        .on("postgres_changes", { event: "*", schema: "public", table: "recettes" }, cb)
        .subscribe();
      return () => sb.removeChannel(ch);
    },
  };
}

function traduire(msg) {
  const m = {
    "Invalid login credentials": "E-mail ou mot de passe incorrect.",
    "User already registered": "Un compte existe déjà avec cet e-mail. Connecte-toi.",
    "Email not confirmed": "Confirme d'abord ton adresse via le mail reçu.",
    "Password should be at least 6 characters.": "Le mot de passe doit faire au moins 6 caractères.",
  };
  return m[msg] || msg;
}

export async function createStore() {
  const c = window.STOCK_CONFIG || {};
  if (c.supabaseUrl && c.supabaseAnonKey) return supabaseStore(c.supabaseUrl, c.supabaseAnonKey);
  return demoStore();
}
