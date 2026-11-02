# Recettes healthy viande / volaille / poisson, pour 2 portions.
# Lancer : python3 recettes_proteines.py > seed_proteines.sql
import json

R = []
def rec(nom, temps, tag, ings, etapes):
    tags = [tag, "healthy"] + (["rapide"] if temps <= 20 else [])
    R.append({"n": nom, "t": temps, "g": tags, "i": [list(i) for i in ings], "e": "\n".join(etapes)})

P = ("Escalopes de poulet", 300, "g"); D = ("Escalopes de dinde", 300, "g"); RIZ = ("Riz basmati", 150, "g")
rec("Poulet au citron et thym, haricots verts", 25, "volaille", [P, ("Haricots verts", 300, "g"), ("Citron", 1, "pièce"), ("Thym",), ("Ail",)],
    ["Cuire les haricots verts 8 min à l'eau bouillante.", "Dorer le poulet 5 min par face avec l'ail et le thym.", "Déglacer avec le jus du citron et servir."])
rec("Brochettes de poulet yakitori, riz et courgette", 30, "volaille", [P, RIZ, ("Courgette", 1, "pièce"), ("Sauce soja",), ("Miel",), ("Graines de sésame",)],
    ["Mariner le poulet en cubes 10 min dans la sauce soja et un peu de miel.", "Cuire le riz.", "Griller les brochettes et la courgette en rondelles 10 min.", "Parsemer de sésame."])
rec("Poulet coco curry, riz et épinards", 30, "volaille", [P, ("Lait de coco", 0.5, "boîte"), RIZ, ("Oignon", 1, "pièce"), ("Épinards frais", 100, "g"), ("Curry",)],
    ["Faire revenir l'oignon et le poulet en dés avec le curry.", "Ajouter le lait de coco, mijoter 12 min.", "Ajouter les épinards à la fin.", "Servir avec le riz."])
rec("Cuisses de poulet rôties, carottes et pommes de terre", 50, "volaille", [("Cuisses de poulet", 2, "pièce"), ("Carottes", 3, "pièce"), ("Pommes de terre", 3, "pièce"), ("Herbes de Provence",)],
    ["Préchauffer le four à 200 °C.", "Disposer les cuisses et les légumes en morceaux dans un plat avec herbes et un filet d'huile.", "Cuire 45 min en retournant à mi-cuisson."])
rec("Salade César légère au poulet", 20, "volaille", [("Escalopes de poulet", 250, "g"), ("Salade romaine", 1, "pièce"), ("Parmesan", 30, "g"), ("Pain complet", 2, "tranche"), ("Yaourt grec", 1, "pot"), ("Citron", 1, "pièce")],
    ["Cuire le poulet et le couper en lanières.", "Griller le pain et le couper en croûtons.", "Mélanger le yaourt, le citron et la moitié du parmesan pour la sauce.", "Assembler avec la salade."])
rec("Poulet teriyaki et brocoli", 25, "volaille", [P, ("Brocoli", 1, "pièce"), RIZ, ("Sauce soja",), ("Miel",), ("Gingembre",)],
    ["Cuire le riz et le brocoli à la vapeur 6 min.", "Saisir le poulet en lanières 6 min.", "Ajouter 3 c. à s. de sauce soja, 1 de miel et le gingembre, laisser caraméliser 2 min."])
rec("Blanquette de poulet légère", 40, "volaille", [P, ("Carottes", 2, "pièce"), ("Champignons", 150, "g"), ("Crème légère", 100, "mL"), RIZ, ("Bouillon cube", 1, "pièce"), ("Oignon", 1, "pièce")],
    ["Faire revenir le poulet en morceaux et l'oignon.", "Couvrir d'eau avec le bouillon, ajouter les carottes en rondelles, cuire 20 min.", "Ajouter les champignons 10 min, puis la crème.", "Servir avec le riz."])
rec("Poulet à la moutarde, courgettes et Ebly", 25, "volaille", [P, ("Courgettes", 2, "pièce"), ("Crème légère", 100, "mL"), ("Ebly", 150, "g"), ("Moutarde",)],
    ["Cuire l'Ebly.", "Dorer le poulet, ajouter les courgettes en dés, cuire 8 min.", "Ajouter la crème et 1 c. à s. de moutarde, laisser réduire 2 min."])
rec("Wok de poulet aux légumes et nouilles", 20, "volaille", [P, ("Nouilles de riz", 150, "g"), ("Poivron", 1, "pièce"), ("Carottes", 2, "pièce"), ("Sauce soja",)],
    ["Réhydrater les nouilles.", "Saisir le poulet en lanières 5 min à feu vif.", "Ajouter les légumes émincés 4 min, puis les nouilles et la sauce soja."])
rec("Dinde au paprika, patate douce et haricots verts", 35, "volaille", [D, ("Patates douces", 2, "pièce"), ("Haricots verts", 200, "g"), ("Paprika",)],
    ["Rôtir les patates douces en cubes 25 min à 200 °C.", "Cuire les haricots verts 8 min.", "Saisir la dinde saupoudrée de paprika 4 min par face."])
rec("Émincé de dinde aux champignons et riz", 25, "volaille", [D, ("Champignons", 250, "g"), ("Crème légère", 100, "mL"), RIZ, ("Oignon", 1, "pièce")],
    ["Cuire le riz.", "Saisir la dinde en lanières, réserver.", "Faire revenir l'oignon et les champignons 6 min, remettre la dinde et la crème, 2 min."])
rec("Saumon au four, quinoa et asperges", 25, "poisson", [("Pavés de saumon", 2, "pièce"), ("Quinoa", 150, "g"), ("Asperges vertes", 250, "g"), ("Citron", 1, "pièce")],
    ["Cuire le quinoa.", "Disposer saumon et asperges sur une plaque avec citron et huile.", "Cuire 15 min à 200 °C."])
rec("Saumon en croûte d'herbes et haricots verts", 25, "poisson", [("Pavés de saumon", 2, "pièce"), ("Haricots verts", 300, "g"), ("Moutarde",), ("Persil",), ("Chapelure",)],
    ["Badigeonner le saumon de moutarde, couvrir de persil et de chapelure.", "Cuire 15 min à 200 °C.", "Cuire les haricots verts 8 min à l'eau."])
rec("Cabillaud et purée de brocoli", 30, "poisson", [("Filets de cabillaud", 300, "g"), ("Brocoli", 1, "pièce"), ("Pommes de terre", 2, "pièce"), ("Citron", 1, "pièce")],
    ["Cuire le brocoli et les pommes de terre 20 min, écraser en purée.", "Poêler le cabillaud 3 min par face, arroser de citron."])
rec("Colin à la provençale et riz", 30, "poisson", [("Filets de colin", 300, "g"), ("Tomates concassées", 1, "boîte"), ("Courgette", 1, "pièce"), RIZ, ("Oignon", 1, "pièce"), ("Herbes de Provence",)],
    ["Faire revenir l'oignon et la courgette en dés, ajouter les tomates, 10 min.", "Déposer le colin dans la sauce, couvrir et cuire 8 min.", "Servir avec le riz."])
rec("Crevettes à l'ail, courgettes et quinoa", 20, "poisson", [("Crevettes décortiquées", 250, "g"), ("Courgettes", 2, "pièce"), ("Quinoa", 150, "g"), ("Citron", 1, "pièce"), ("Ail",)],
    ["Cuire le quinoa.", "Poêler les courgettes en dés 6 min.", "Ajouter les crevettes et l'ail 3 min, arroser de citron."])
rec("Curry de crevettes au lait de coco", 25, "poisson", [("Crevettes décortiquées", 250, "g"), ("Lait de coco", 1, "boîte"), ("Tomates concassées", 1, "boîte"), RIZ, ("Oignon", 1, "pièce"), ("Curry",)],
    ["Faire revenir l'oignon avec le curry.", "Ajouter tomates et lait de coco, mijoter 10 min.", "Ajouter les crevettes 4 min.", "Servir avec le riz."])
rec("Tacos de cabillaud, chou rouge et yaourt", 25, "poisson", [("Filets de cabillaud", 300, "g"), ("Tortillas complètes", 4, "pièce"), ("Chou rouge", 0.5, "pièce"), ("Yaourt grec", 1, "pot"), ("Citron vert", 1, "pièce"), ("Mélange épices fajitas", 0.5, "sachet")],
    ["Émincer finement le chou, l'assaisonner de citron vert.", "Poêler le cabillaud avec les épices 6 min, l'émietter.", "Garnir les tortillas de poisson, chou et yaourt."])
rec("Maquereau rôti, pommes de terre et salade", 35, "poisson", [("Filets de maquereau", 2, "pièce"), ("Pommes de terre", 3, "pièce"), ("Salade verte", 1, "pièce"), ("Citron", 1, "pièce")],
    ["Rôtir les pommes de terre en quartiers 25 min à 200 °C.", "Ajouter les maquereaux les 8 dernières minutes.", "Servir avec la salade et le citron."])
rec("Tartines de sardines, tomates et salade", 10, "poisson", [("Sardines", 1, "boîte"), ("Pain complet", 4, "tranche"), ("Tomates", 2, "pièce"), ("Salade verte", 1, "pièce"), ("Citron", 1, "pièce")],
    ["Griller le pain.", "Écraser les sardines avec le citron.", "Garnir les tartines de tomates et de sardines, servir avec la salade."])
rec("Steak de thon, riz et légumes sautés", 20, "poisson", [("Steaks de thon", 2, "pièce"), RIZ, ("Poivron", 1, "pièce"), ("Courgette", 1, "pièce"), ("Sauce soja",)],
    ["Cuire le riz.", "Sauter les légumes émincés 6 min.", "Saisir le thon 2 min par face, arroser de sauce soja."])
rec("Bœuf sauté aux poivrons et riz", 25, "viande", [("Émincé de bœuf", 300, "g"), ("Poivrons", 2, "pièce"), ("Oignon", 1, "pièce"), RIZ, ("Sauce soja",)],
    ["Cuire le riz.", "Saisir le bœuf 2 min à feu vif, réserver.", "Sauter poivrons et oignon 5 min, remettre le bœuf et la sauce soja."])
rec("Steak, haricots verts et patate douce rôtie", 35, "viande", [("Steaks de bœuf", 2, "pièce"), ("Haricots verts", 300, "g"), ("Patates douces", 2, "pièce")],
    ["Rôtir les patates douces en frites 25 min à 200 °C.", "Cuire les haricots verts 8 min.", "Cuire les steaks à la poêle selon la cuisson voulue."])
rec("Boulettes de bœuf à la tomate et pâtes complètes", 35, "viande", [("Viande hachée 5 %", 300, "g"), ("Pâtes complètes", 160, "g"), ("Tomates concassées", 1, "boîte"), ("Oignon", 1, "pièce"), ("Œufs", 1, "pièce")],
    ["Mélanger la viande avec l'œuf, former des boulettes.", "Les dorer 5 min, ajouter l'oignon et les tomates, mijoter 15 min.", "Servir avec les pâtes."])
rec("Chili con carne léger", 40, "viande", [("Viande hachée 5 %", 300, "g"), ("Haricots rouges", 1, "boîte"), ("Tomates concassées", 1, "boîte"), ("Maïs doux", 1, "boîte"), ("Oignon", 1, "pièce"), RIZ, ("Cumin",)],
    ["Faire revenir l'oignon et la viande.", "Ajouter le cumin, les tomates, les haricots et le maïs, mijoter 20 min.", "Servir avec le riz."])
rec("Filet mignon à la moutarde et haricots verts", 35, "viande", [("Filet mignon de porc", 400, "g"), ("Haricots verts", 300, "g"), ("Pommes de terre", 2, "pièce"), ("Moutarde",)],
    ["Badigeonner le filet mignon de moutarde, le cuire 25 min à 200 °C.", "Cuire les pommes de terre et les haricots verts à l'eau.", "Trancher et servir."])
rec("Poulet tandoori, raïta et boulgour", 30, "volaille", [P, ("Yaourt grec", 1, "pot"), ("Concombre", 1, "pièce"), ("Boulgour", 150, "g"), ("Épices tandoori",)],
    ["Mariner le poulet dans la moitié du yaourt et les épices.", "Cuire le boulgour.", "Poêler le poulet 10 min.", "Mélanger le reste du yaourt et le concombre râpé pour la raïta."])
rec("Bowl poulet, quinoa et avocat", 25, "volaille", [P, ("Quinoa", 150, "g"), ("Avocat", 1, "pièce"), ("Tomates cerises", 150, "g"), ("Maïs doux", 1, "boîte"), ("Citron vert", 1, "pièce")],
    ["Cuire le quinoa.", "Griller le poulet et le couper en lanières.", "Dresser les bols avec l'avocat, les tomates et le maïs, arroser de citron vert."])
rec("Papillote de saumon aux poireaux", 30, "poisson", [("Pavés de saumon", 2, "pièce"), ("Poireaux", 2, "pièce"), ("Pommes de terre", 3, "pièce"), ("Crème légère", 50, "mL")],
    ["Faire fondre les poireaux émincés 10 min.", "Disposer poireaux, saumon et crème en papillotes, cuire 15 min à 200 °C.", "Servir avec les pommes de terre vapeur."])
rec("Lieu noir sauce vierge et riz", 25, "poisson", [("Filets de lieu noir", 300, "g"), ("Tomates", 2, "pièce"), ("Citron", 1, "pièce"), RIZ, ("Basilic",), ("Huile d'olive",)],
    ["Cuire le riz.", "Couper les tomates en petits dés, mélanger avec huile, citron et basilic.", "Poêler le poisson 3 min par face, napper de sauce vierge."])
rec("Salade de crevettes, avocat et pamplemousse", 15, "poisson", [("Crevettes décortiquées", 200, "g"), ("Avocat", 1, "pièce"), ("Pamplemousse", 1, "pièce"), ("Salade verte", 1, "pièce")],
    ["Peler le pamplemousse à vif et le couper en suprêmes.", "Couper l'avocat.", "Assembler avec la salade et les crevettes."])
rec("Poulet au basilic thaï", 20, "volaille", [P, ("Haricots verts", 200, "g"), RIZ, ("Sauce soja",), ("Basilic",), ("Ail",)],
    ["Cuire le riz.", "Saisir le poulet haché au couteau avec l'ail 5 min.", "Ajouter les haricots verts coupés et la sauce soja, 5 min, puis le basilic."])
rec("Escalopes de dinde panées au four, purée de carottes", 35, "volaille", [D, ("Carottes", 4, "pièce"), ("Pommes de terre", 1, "pièce"), ("Œufs", 1, "pièce"), ("Chapelure",)],
    ["Passer la dinde dans l'œuf battu puis la chapelure, cuire 20 min à 200 °C.", "Cuire carottes et pomme de terre 20 min, mixer en purée."])
rec("Gratin de cabillaud aux épinards", 35, "poisson", [("Filets de cabillaud", 300, "g"), ("Épinards frais", 300, "g"), ("Crème légère", 100, "mL"), ("Emmental râpé", 40, "g"), RIZ],
    ["Faire tomber les épinards.", "Disposer épinards et cabillaud dans un plat, napper de crème, parsemer d'emmental.", "Cuire 20 min à 200 °C.", "Servir avec le riz."])

if __name__ == "__main__":
    data = json.dumps(R, ensure_ascii=False, separators=(",", ":"))
    print(f"""with data as (select $j${data}$j$::jsonb d),
foyer as (select id from foyers order by cree_le limit 1),
src as (select e from data, jsonb_array_elements(d) e),
ins as (
  insert into recettes (foyer_id, nom, portions, temps_min, etapes, tags, source)
  select foyer.id, e->>'n', 2, (e->>'t')::int, e->>'e', array(select jsonb_array_elements_text(e->'g')), 'claude'
  from src, foyer where not exists (select 1 from recettes r where r.foyer_id = foyer.id and r.nom = e->>'n')
  returning id, nom
)
insert into recette_ingredients (recette_id, nom, quantite, unite, ordre)
select ins.id, i.v->>0, (i.v->>1)::numeric, i.v->>2, i.n - 1
from ins join src on src.e->>'n' = ins.nom
cross join lateral jsonb_array_elements(src.e->'i') with ordinality as i(v, n);""")
