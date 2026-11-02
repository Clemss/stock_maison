# Recettes healthy pour 2 portions.
# Ingrédient = (nom, quantité, unité) ; sans quantité = basique (sel, huile, épices…), non suivi.
# Lancer : python3 recettes_healthy.py > seed_recettes.sql
import json, sys

R = []
def rec(nom, temps, tags, ings, etapes):
    R.append({"nom": nom, "portions": 2, "temps_min": temps, "tags": tags,
              "ingredients": [{"nom": i[0], "quantite": i[1] if len(i) > 1 else None, "unite": i[2] if len(i) > 2 else None} for i in ings],
              "etapes": "\n".join(etapes)})

rec("Buddha bowl quinoa et pois chiches", 25, ["végé", "healthy"],
    [("Quinoa", 150, "g"), ("Pois chiches", 1, "boîte"), ("Carottes", 2, "pièce"), ("Avocat", 1, "pièce"), ("Concombre", 1, "pièce"), ("Citron", 1, "pièce"), ("Yaourt grec", 1, "pot"), ("Huile d'olive",), ("Cumin",)],
    ["Cuire le quinoa 12 min.", "Égoutter et rincer les pois chiches, les poêler 5 min avec le cumin.", "Râper les carottes, couper l'avocat et le concombre.", "Mélanger le yaourt avec le jus de citron, sel et poivre.", "Dresser les bols et napper de sauce."])
rec("Salade de thon et haricots blancs", 10, ["poisson", "rapide", "healthy"],
    [("Thon au naturel", 1, "boîte"), ("Haricots blancs", 1, "boîte"), ("Tomates", 2, "pièce"), ("Oignon rouge", 1, "pièce"), ("Persil",), ("Huile d'olive",), ("Vinaigre",)],
    ["Égoutter et rincer les haricots blancs.", "Couper les tomates et émincer finement l'oignon rouge.", "Mélanger avec le thon émietté, l'huile, le vinaigre et le persil."])
rec("Chili sin carne", 35, ["végé", "healthy"],
    [("Haricots rouges", 1, "boîte"), ("Maïs doux", 1, "boîte"), ("Tomates concassées", 1, "boîte"), ("Oignon", 1, "pièce"), ("Poivron", 1, "pièce"), ("Riz basmati", 150, "g"), ("Cumin",), ("Paprika",)],
    ["Faire revenir l'oignon et le poivron émincés 5 min.", "Ajouter les épices, les tomates, les haricots rouges et le maïs égouttés.", "Laisser mijoter 20 min.", "Servir avec le riz cuit."])
rec("Fajitas de poulet légères", 25, ["volaille", "healthy"],
    [("Escalopes de poulet", 300, "g"), ("Poivrons", 2, "pièce"), ("Oignon", 1, "pièce"), ("Tortillas complètes", 4, "pièce"), ("Mélange épices fajitas", 1, "sachet"), ("Yaourt grec", 1, "pot")],
    ["Couper le poulet en lanières, les poivrons et l'oignon en fines tranches.", "Saisir le poulet 5 min, ajouter les légumes et le mélange d'épices avec un peu d'eau.", "Cuire 8 min.", "Garnir les tortillas chaudes et servir avec le yaourt grec."])
rec("Saumon, riz et brocoli", 25, ["poisson", "healthy"],
    [("Pavés de saumon", 2, "pièce"), ("Riz basmati", 150, "g"), ("Brocoli", 1, "pièce"), ("Citron", 1, "pièce"), ("Sauce soja",)],
    ["Cuire le riz.", "Cuire le brocoli en fleurettes 6 min à la vapeur.", "Cuire le saumon 4 min par face à la poêle.", "Arroser de citron et d'un trait de sauce soja."])
rec("Poêlée de poulet, courgettes et Ebly", 25, ["volaille", "healthy"],
    [("Escalopes de poulet", 300, "g"), ("Courgettes", 2, "pièce"), ("Ebly", 150, "g"), ("Ail",), ("Herbes de Provence",)],
    ["Cuire l'Ebly 10 min.", "Saisir le poulet en dés 5 min.", "Ajouter les courgettes en dés, l'ail et les herbes, cuire 8 min.", "Mélanger avec l'Ebly."])
rec("Curry de lentilles corail", 30, ["végé", "healthy"],
    [("Lentilles corail", 200, "g"), ("Lait de coco", 1, "boîte"), ("Tomates concassées", 1, "boîte"), ("Oignon", 1, "pièce"), ("Épinards frais", 100, "g"), ("Curry",)],
    ["Faire revenir l'oignon avec le curry.", "Ajouter les lentilles rincées, les tomates, le lait de coco et 30 cl d'eau.", "Cuire 20 min en remuant.", "Ajouter les épinards 2 min avant la fin."])
rec("Omelette aux légumes", 15, ["végé", "rapide", "healthy"],
    [("Œufs", 4, "pièce"), ("Courgette", 1, "pièce"), ("Champignons", 150, "g"), ("Oignon", 1, "pièce"), ("Salade verte", 1, "pièce")],
    ["Faire revenir l'oignon, la courgette et les champignons 6 min.", "Verser les œufs battus, cuire 4 min à feu doux.", "Servir avec la salade."])
rec("Soupe de légumes maison", 35, ["végé", "healthy"],
    [("Carottes", 3, "pièce"), ("Poireau", 1, "pièce"), ("Pommes de terre", 2, "pièce"), ("Courgette", 1, "pièce"), ("Bouillon cube", 1, "pièce")],
    ["Éplucher et couper les légumes en morceaux.", "Couvrir d'eau avec le bouillon, cuire 25 min.", "Mixer, saler et poivrer."])
rec("Cabillaud en papillote et haricots verts", 25, ["poisson", "healthy"],
    [("Filets de cabillaud", 300, "g"), ("Haricots verts", 300, "g"), ("Citron", 1, "pièce"), ("Tomates cerises", 150, "g"), ("Huile d'olive",)],
    ["Préchauffer le four à 200 °C.", "Déposer le poisson, les tomates cerises et des rondelles de citron sur du papier cuisson, fermer en papillote.", "Cuire 15 min.", "Cuire les haricots verts 8 min à l'eau bouillante."])
rec("Wok de crevettes et légumes", 20, ["poisson", "rapide", "healthy"],
    [("Crevettes décortiquées", 200, "g"), ("Nouilles de riz", 150, "g"), ("Poivron", 1, "pièce"), ("Carottes", 2, "pièce"), ("Brocoli", 1, "pièce"), ("Sauce soja",), ("Gingembre",)],
    ["Réhydrater les nouilles dans l'eau chaude.", "Faire sauter les légumes en lanières 5 min à feu vif.", "Ajouter les crevettes et le gingembre, 3 min.", "Ajouter les nouilles et la sauce soja, mélanger."])
rec("Salade de quinoa méditerranéenne", 20, ["végé", "healthy"],
    [("Quinoa", 150, "g"), ("Concombre", 1, "pièce"), ("Tomates", 2, "pièce"), ("Feta", 100, "g"), ("Oignon rouge", 1, "pièce"), ("Citron", 1, "pièce"), ("Huile d'olive",)],
    ["Cuire le quinoa et le laisser refroidir.", "Couper les légumes en dés et émietter la feta.", "Mélanger avec le jus de citron et l'huile d'olive."])
rec("Pois chiches au curry et épinards", 25, ["végé", "healthy"],
    [("Pois chiches", 1, "boîte"), ("Épinards frais", 150, "g"), ("Tomates concassées", 1, "boîte"), ("Oignon", 1, "pièce"), ("Riz basmati", 120, "g"), ("Curry",)],
    ["Faire revenir l'oignon avec le curry.", "Ajouter les tomates et les pois chiches égouttés, mijoter 12 min.", "Ajouter les épinards jusqu'à ce qu'ils fondent.", "Servir avec le riz."])
rec("Poulet, patate douce et haricots verts", 40, ["volaille", "healthy"],
    [("Escalopes de poulet", 300, "g"), ("Patates douces", 2, "pièce"), ("Haricots verts", 200, "g"), ("Paprika",), ("Huile d'olive",)],
    ["Couper les patates douces en cubes, les rôtir 30 min à 200 °C avec huile et paprika.", "Cuire le poulet à la poêle 10 min.", "Cuire les haricots verts 8 min à l'eau."])
rec("Pâtes complètes au thon et tomate", 20, ["poisson", "rapide", "healthy"],
    [("Pâtes complètes", 200, "g"), ("Thon au naturel", 1, "boîte"), ("Tomates concassées", 1, "boîte"), ("Oignon", 1, "pièce"), ("Basilic",)],
    ["Cuire les pâtes.", "Faire revenir l'oignon, ajouter les tomates et cuire 10 min.", "Ajouter le thon émietté et le basilic, mélanger aux pâtes."])
rec("Gratin léger de courgettes", 40, ["végé", "healthy"],
    [("Courgettes", 3, "pièce"), ("Œufs", 2, "pièce"), ("Lait demi-écrémé", 200, "mL"), ("Emmental râpé", 50, "g"), ("Muscade",)],
    ["Couper les courgettes en rondelles et les faire revenir 8 min.", "Battre les œufs avec le lait, sel, poivre et muscade.", "Verser sur les courgettes dans un plat, parsemer d'emmental.", "Cuire 25 min à 180 °C."])
rec("Poke bowl saumon et avocat", 25, ["poisson", "healthy"],
    [("Riz basmati", 150, "g"), ("Pavés de saumon", 2, "pièce"), ("Avocat", 1, "pièce"), ("Concombre", 1, "pièce"), ("Carottes", 1, "pièce"), ("Sauce soja",), ("Graines de sésame",)],
    ["Cuire le riz et le laisser tiédir.", "Cuire le saumon et l'émietter (ou le couper en cubes s'il est très frais).", "Couper l'avocat, le concombre et râper la carotte.", "Dresser et assaisonner de sauce soja et sésame."])
rec("Salade de lentilles vertes", 30, ["végé", "healthy"],
    [("Lentilles vertes", 200, "g"), ("Carottes", 2, "pièce"), ("Oignon rouge", 1, "pièce"), ("Œufs", 2, "pièce"), ("Moutarde",), ("Vinaigre",)],
    ["Cuire les lentilles 20 min et les laisser tiédir.", "Cuire les œufs 9 min, les écaler.", "Couper les carottes en petits dés et l'oignon finement.", "Mélanger avec une vinaigrette à la moutarde."])
rec("Tacos de dinde et maïs", 20, ["volaille", "rapide", "healthy"],
    [("Escalopes de dinde", 300, "g"), ("Tortillas complètes", 4, "pièce"), ("Maïs doux", 1, "boîte"), ("Tomates", 2, "pièce"), ("Salade verte", 1, "pièce"), ("Yaourt grec", 1, "pot"), ("Paprika",)],
    ["Couper la dinde en lanières et la saisir 6 min avec le paprika.", "Couper les tomates et la salade.", "Garnir les tortillas avec la dinde, le maïs, les crudités et le yaourt."])
rec("Minestrone", 35, ["végé", "healthy"],
    [("Haricots blancs", 1, "boîte"), ("Courgette", 1, "pièce"), ("Carottes", 2, "pièce"), ("Tomates concassées", 1, "boîte"), ("Pâtes complètes", 80, "g"), ("Oignon", 1, "pièce"), ("Bouillon cube", 1, "pièce")],
    ["Faire revenir l'oignon et les carottes en dés.", "Ajouter la courgette, les tomates, le bouillon et 1 L d'eau, cuire 15 min.", "Ajouter les pâtes et les haricots blancs, cuire 10 min."])
rec("Steak haché 5 % et légumes rôtis", 40, ["viande", "healthy"],
    [("Steaks hachés 5 %", 2, "pièce"), ("Pommes de terre", 3, "pièce"), ("Courgette", 1, "pièce"), ("Poivron", 1, "pièce"), ("Oignon rouge", 1, "pièce"), ("Herbes de Provence",)],
    ["Couper les légumes en morceaux, les rôtir 30 min à 200 °C avec huile et herbes.", "Cuire les steaks à la poêle selon la cuisson voulue."])
rec("Shakshuka", 25, ["végé", "healthy"],
    [("Œufs", 4, "pièce"), ("Tomates concassées", 1, "boîte"), ("Poivron", 1, "pièce"), ("Oignon", 1, "pièce"), ("Cumin",), ("Paprika",)],
    ["Faire revenir l'oignon et le poivron 8 min.", "Ajouter les tomates et les épices, mijoter 10 min.", "Creuser 4 puits, y casser les œufs et cuire à couvert 6 min."])
rec("Salade niçoise", 25, ["poisson", "healthy"],
    [("Thon au naturel", 1, "boîte"), ("Œufs", 2, "pièce"), ("Haricots verts", 200, "g"), ("Tomates", 2, "pièce"), ("Pommes de terre", 2, "pièce"), ("Salade verte", 1, "pièce"), ("Huile d'olive",)],
    ["Cuire les pommes de terre 20 min, les haricots verts 8 min et les œufs 9 min.", "Couper les tomates et les pommes de terre.", "Dresser sur la salade avec le thon et les œufs."])
rec("Risotto léger aux champignons", 35, ["végé", "healthy"],
    [("Riz arborio", 150, "g"), ("Champignons", 250, "g"), ("Oignon", 1, "pièce"), ("Bouillon cube", 1, "pièce"), ("Parmesan", 30, "g"), ("Vin blanc sec", 0.5, "bouteille")],
    ["Faire revenir l'oignon et les champignons.", "Ajouter le riz, le nacrer 2 min, puis déglacer au vin blanc.", "Ajouter le bouillon chaud louche par louche pendant 18 min.", "Terminer avec le parmesan."])
rec("Poulet basquaise léger", 40, ["volaille", "healthy"],
    [("Escalopes de poulet", 300, "g"), ("Poivrons", 2, "pièce"), ("Tomates concassées", 1, "boîte"), ("Oignon", 1, "pièce"), ("Riz basmati", 150, "g"), ("Ail",)],
    ["Dorer le poulet en morceaux, réserver.", "Faire revenir oignon, ail et poivrons 8 min.", "Ajouter les tomates et le poulet, mijoter 20 min.", "Servir avec le riz."])
rec("Colin, quinoa et poireaux fondants", 30, ["poisson", "healthy"],
    [("Filets de colin", 300, "g"), ("Quinoa", 150, "g"), ("Poireaux", 2, "pièce"), ("Crème légère", 100, "mL")],
    ["Cuire le quinoa.", "Faire fondre les poireaux émincés 15 min à couvert, ajouter la crème.", "Cuire le colin 4 min par face à la poêle."])
rec("Velouté de potiron", 35, ["végé", "healthy"],
    [("Potiron", 800, "g"), ("Pommes de terre", 1, "pièce"), ("Oignon", 1, "pièce"), ("Bouillon cube", 1, "pièce"), ("Crème légère", 50, "mL")],
    ["Couper le potiron, la pomme de terre et l'oignon.", "Couvrir d'eau avec le bouillon et cuire 25 min.", "Mixer avec la crème."])
rec("Wraps complets au poulet et crudités", 15, ["volaille", "rapide", "healthy"],
    [("Tortillas complètes", 4, "pièce"), ("Blanc de poulet", 4, "tranche"), ("Salade verte", 1, "pièce"), ("Tomates", 2, "pièce"), ("Carottes", 1, "pièce"), ("Fromage frais", 50, "g")],
    ["Tartiner les tortillas de fromage frais.", "Garnir de poulet, salade, tomates et carotte râpée.", "Rouler et couper en deux."])
rec("Burrito bowl haricots rouges et avocat", 25, ["végé", "healthy"],
    [("Riz basmati", 150, "g"), ("Haricots rouges", 1, "boîte"), ("Maïs doux", 1, "boîte"), ("Avocat", 1, "pièce"), ("Tomates", 2, "pièce"), ("Citron vert", 1, "pièce"), ("Mélange épices fajitas", 0.5, "sachet")],
    ["Cuire le riz.", "Réchauffer les haricots rouges avec le mélange d'épices.", "Couper l'avocat et les tomates.", "Dresser les bols avec le maïs et un filet de citron vert."])
rec("Salade de pois chiches, concombre et feta", 10, ["végé", "rapide", "healthy"],
    [("Pois chiches", 1, "boîte"), ("Concombre", 1, "pièce"), ("Tomates", 2, "pièce"), ("Feta", 100, "g"), ("Oignon rouge", 1, "pièce"), ("Citron", 1, "pièce"), ("Huile d'olive",)],
    ["Égoutter les pois chiches.", "Couper les légumes en dés et émietter la feta.", "Assaisonner de citron et d'huile d'olive."])
rec("Saumon et purée de patate douce", 30, ["poisson", "healthy"],
    [("Pavés de saumon", 2, "pièce"), ("Patates douces", 2, "pièce"), ("Épinards frais", 150, "g")],
    ["Cuire les patates douces 20 min à l'eau, les écraser en purée.", "Cuire le saumon 4 min par face.", "Faire tomber les épinards 2 min à la poêle."])
rec("Tortilla de pommes de terre", 35, ["végé", "healthy"],
    [("Œufs", 5, "pièce"), ("Pommes de terre", 3, "pièce"), ("Oignon", 1, "pièce"), ("Salade verte", 1, "pièce"), ("Huile d'olive",)],
    ["Couper les pommes de terre en fines tranches, les cuire 15 min à la poêle avec l'oignon.", "Verser les œufs battus, cuire 8 min à feu doux.", "Retourner et cuire 3 min. Servir avec la salade."])
rec("Poulet tikka léger", 30, ["volaille", "healthy"],
    [("Escalopes de poulet", 300, "g"), ("Yaourt grec", 1, "pot"), ("Riz basmati", 150, "g"), ("Concombre", 1, "pièce"), ("Garam masala",)],
    ["Mariner le poulet en dés dans la moitié du yaourt et les épices (10 min minimum).", "Cuire à la poêle 10 min.", "Servir avec le riz et une raïta : reste du yaourt et concombre râpé."])
rec("Spaghetti de courgettes bolognaise", 30, ["viande", "healthy"],
    [("Courgettes", 3, "pièce"), ("Steaks hachés 5 %", 2, "pièce"), ("Tomates concassées", 1, "boîte"), ("Concentré de tomates", 1, "boîte"), ("Oignon", 1, "pièce")],
    ["Faire revenir l'oignon et la viande émiettée.", "Ajouter les tomates et le concentré, mijoter 15 min.", "Tailler les courgettes en spaghetti, les poêler 3 min.", "Servir avec la sauce."])
rec("Salade tiède haricots verts, œufs et quinoa", 25, ["végé", "healthy"],
    [("Haricots verts", 300, "g"), ("Œufs", 4, "pièce"), ("Quinoa", 120, "g"), ("Échalote", 1, "pièce"), ("Moutarde",)],
    ["Cuire le quinoa, les haricots verts 8 min et les œufs 7 min.", "Préparer une vinaigrette avec l'échalote et la moutarde.", "Mélanger le tout et ajouter les œufs coupés en deux."])
rec("Cabillaud à la tomate et pois chiches", 25, ["poisson", "healthy"],
    [("Filets de cabillaud", 300, "g"), ("Pois chiches", 1, "boîte"), ("Tomate frito", 1, "boîte"), ("Oignon", 1, "pièce"), ("Épinards frais", 100, "g")],
    ["Faire revenir l'oignon.", "Ajouter la sauce tomate et les pois chiches, mijoter 8 min.", "Déposer le cabillaud dans la sauce, couvrir et cuire 8 min.", "Ajouter les épinards à la fin."])
rec("Dinde à la moutarde, riz et haricots verts", 25, ["volaille", "healthy"],
    [("Escalopes de dinde", 300, "g"), ("Haricots verts", 300, "g"), ("Riz basmati", 150, "g"), ("Crème légère", 100, "mL"), ("Moutarde",)],
    ["Cuire le riz et les haricots verts.", "Saisir la dinde 5 min par face.", "Ajouter la crème et une cuillère de moutarde, laisser réduire 3 min."])
rec("Taboulé de boulgour aux pois chiches", 20, ["végé", "healthy"],
    [("Boulgour", 150, "g"), ("Tomates", 2, "pièce"), ("Concombre", 1, "pièce"), ("Menthe fraîche", 1, "pièce"), ("Citron", 2, "pièce"), ("Pois chiches", 1, "boîte"), ("Huile d'olive",)],
    ["Cuire le boulgour 10 min, l'égoutter et le laisser refroidir.", "Couper les légumes en petits dés, ciseler la menthe.", "Mélanger avec les pois chiches, le jus de citron et l'huile."])
rec("Tofu sauté aux légumes", 25, ["végé", "healthy"],
    [("Tofu ferme", 200, "g"), ("Brocoli", 1, "pièce"), ("Poivron", 1, "pièce"), ("Champignons", 150, "g"), ("Riz basmati", 150, "g"), ("Sauce soja",)],
    ["Cuire le riz.", "Dorer le tofu en cubes 6 min.", "Ajouter les légumes émincés, sauter 6 min à feu vif.", "Assaisonner de sauce soja."])
rec("Salade de riz au thon et maïs", 25, ["poisson", "healthy"],
    [("Riz basmati", 150, "g"), ("Thon au naturel", 1, "boîte"), ("Maïs doux", 1, "boîte"), ("Tomates", 2, "pièce"), ("Œufs", 2, "pièce"), ("Poivron", 1, "pièce"), ("Vinaigre",)],
    ["Cuire le riz et les œufs (9 min), laisser refroidir.", "Couper les tomates et le poivron en dés.", "Mélanger avec le thon, le maïs et une vinaigrette."])
rec("Haricots blancs à la tomate et œufs", 20, ["végé", "rapide", "healthy"],
    [("Haricots blancs", 1, "boîte"), ("Tomate frito", 1, "boîte"), ("Œufs", 4, "pièce"), ("Épinards frais", 100, "g"), ("Paprika",)],
    ["Réchauffer les haricots blancs dans la sauce tomate avec le paprika.", "Ajouter les épinards.", "Casser les œufs dessus, couvrir et cuire 6 min."])
rec("Truite, boulgour et courgettes", 25, ["poisson", "healthy"],
    [("Pavés de truite", 2, "pièce"), ("Boulgour", 150, "g"), ("Courgettes", 2, "pièce"), ("Citron", 1, "pièce")],
    ["Cuire le boulgour.", "Poêler les courgettes en rondelles 8 min.", "Cuire la truite 3 min par face, arroser de citron."])

if __name__ == "__main__":
    data = json.dumps(R, ensure_ascii=False)
    print(f"""-- {len(R)} recettes healthy pour le foyer (ignore celles déjà présentes, même nom)
with data as (select $j${data}$j$::jsonb d),
foyer as (select id from foyers order by cree_le limit 1),
src as (select e from data, jsonb_array_elements(d) e),
ins as (
  insert into recettes (foyer_id, nom, portions, temps_min, etapes, tags, source)
  select foyer.id, e->>'nom', (e->>'portions')::int, (e->>'temps_min')::int, e->>'etapes',
         array(select jsonb_array_elements_text(e->'tags')), 'claude'
  from src, foyer
  where not exists (select 1 from recettes r where r.foyer_id = foyer.id and r.nom = e->>'nom')
  returning id, nom
)
insert into recette_ingredients (recette_id, nom, quantite, unite, ordre)
select ins.id, i.v->>'nom', (i.v->>'quantite')::numeric, i.v->>'unite', i.n - 1
from ins join src on src.e->>'nom' = ins.nom
cross join lateral jsonb_array_elements(src.e->'ingredients') with ordinality as i(v, n);""")
    if "--json" in sys.argv:
        open("recettes_healthy.json", "w").write(json.dumps(R, ensure_ascii=False, indent=1))
