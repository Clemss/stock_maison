# Lot 3 : 26 gamelles du midi (4 portions, se réchauffent et se congèlent) + 25 dîners (2 portions), viande et poisson.
# Lancer : python3 recettes_lot3.py > seed_lot3.sql
import json

R = []
CONSERVATION = "À conserver 3 jours au frigo en boîtes, ou jusqu'à 3 mois au congélateur. Réchauffer 2 à 3 min au micro-ondes en remuant à mi-chemin."
def rec(nom, temps, tags, ings, etapes, portions=2):
    tags = list(tags) + ["healthy"] + (["rapide"] if temps <= 20 else [])
    if "gamelle" in tags: etapes = etapes + [CONSERVATION]
    R.append({"n": nom, "p": portions, "t": temps, "g": tags, "i": [list(i) for i in ings], "e": "\n".join(etapes)})
def gamelle(nom, temps, prot, ings, etapes): rec(nom, temps, [prot, "gamelle"], ings, etapes, portions=4)

RIZ3 = ("Riz basmati", 300, "g")
# ---------------- Gamelles (4 portions) ----------------
gamelle("Curry de poulet aux légumes et riz", 35, "volaille", [("Escalopes de poulet", 600, "g"), ("Lait de coco", 1, "boîte"), ("Courgettes", 2, "pièce"), ("Poivrons", 2, "pièce"), ("Oignon", 1, "pièce"), RIZ3, ("Curry",)],
    ["Faire revenir l'oignon et le poulet en dés avec le curry 5 min.", "Ajouter les légumes en dés et le lait de coco, mijoter 15 min.", "Cuire le riz et répartir en 4 boîtes avec le curry."])
gamelle("Bœuf mijoté aux carottes et pommes de terre", 120, "viande", [("Bœuf à mijoter", 620, "g"), ("Carottes", 6, "pièce"), ("Oignon", 2, "pièce"), ("Champignons", 250, "g"), ("Pommes de terre", 6, "pièce"), ("Bouillon cube", 1, "pièce"), ("Thym",)],
    ["Dorer le bœuf en morceaux dans une cocotte, ajouter les oignons.", "Couvrir de bouillon, ajouter les carottes et le thym, mijoter 1 h 30 à couvert.", "Ajouter les pommes de terre et les champignons pour les 30 dernières minutes."])
gamelle("Hachis parmentier de patate douce", 50, "viande", [("Viande hachée 5 %", 500, "g"), ("Patates douces", 4, "pièce"), ("Oignon", 1, "pièce"), ("Concentré de tomates", 1, "boîte"), ("Emmental râpé", 60, "g")],
    ["Cuire les patates douces 20 min à l'eau, les écraser en purée.", "Faire revenir l'oignon et la viande avec le concentré de tomates.", "Étaler la viande puis la purée dans un plat, parsemer d'emmental.", "Gratiner 20 min à 200 °C, puis découper en 4 parts."])
gamelle("Lasagnes légères à la bolognaise", 60, "viande", [("Viande hachée 5 %", 500, "g"), ("Feuilles de lasagne", 250, "g"), ("Tomates concassées", 2, "boîte"), ("Courgettes", 2, "pièce"), ("Lait demi-écrémé", 500, "mL"), ("Emmental râpé", 80, "g"), ("Oignon", 1, "pièce")],
    ["Préparer la bolognaise : oignon, viande, courgettes râpées et tomates, 15 min.", "Épaissir le lait chaud avec 2 c. à s. de maïzena pour une béchamel légère.", "Alterner feuilles, bolognaise et béchamel, finir par l'emmental.", "Cuire 35 min à 180 °C."])
gamelle("Sauté de dinde aux poivrons et boulgour", 35, "volaille", [("Escalopes de dinde", 600, "g"), ("Poivrons", 3, "pièce"), ("Tomates concassées", 1, "boîte"), ("Oignon", 1, "pièce"), ("Boulgour", 300, "g"), ("Paprika",)],
    ["Saisir la dinde en lanières avec le paprika.", "Ajouter l'oignon et les poivrons, puis les tomates, mijoter 15 min.", "Cuire le boulgour et répartir."])
gamelle("Colombo de poulet et riz", 50, "volaille", [("Hauts de cuisse de poulet", 700, "g"), ("Pommes de terre", 4, "pièce"), ("Courgettes", 2, "pièce"), ("Lait de coco", 0.5, "boîte"), ("Oignon", 1, "pièce"), RIZ3, ("Épices colombo",)],
    ["Dorer le poulet avec l'oignon et les épices.", "Ajouter les pommes de terre et les courgettes en cubes, le lait de coco et un verre d'eau.", "Mijoter 35 min à couvert.", "Servir avec le riz."])
gamelle("Boulettes de poulet sauce tomate et pâtes complètes", 40, "volaille", [("Escalopes de poulet", 500, "g"), ("Œufs", 1, "pièce"), ("Tomates concassées", 2, "boîte"), ("Pâtes complètes", 320, "g"), ("Oignon", 1, "pièce"), ("Herbes de Provence",)],
    ["Mixer le poulet avec l'œuf et les herbes, former des boulettes.", "Les dorer, ajouter l'oignon et les tomates, mijoter 20 min.", "Cuire les pâtes et répartir."])
gamelle("Gratin de pâtes au thon et brocoli", 40, "poisson", [("Pâtes complètes", 320, "g"), ("Thon au naturel", 3, "boîte"), ("Brocoli", 2, "pièce"), ("Crème légère", 200, "mL"), ("Emmental râpé", 80, "g")],
    ["Cuire les pâtes et le brocoli ensemble 8 min.", "Mélanger avec le thon émietté et la crème.", "Parsemer d'emmental et gratiner 20 min à 200 °C."])
gamelle("Brandade légère de colin", 45, "poisson", [("Filets de colin", 500, "g"), ("Pommes de terre", 8, "pièce"), ("Lait demi-écrémé", 200, "mL"), ("Ail",), ("Persil",)],
    ["Cuire les pommes de terre 20 min, le colin 8 min dans le lait frémissant.", "Écraser les pommes de terre avec le lait, l'ail et le poisson émietté.", "Mettre en plat, gratiner 15 min à 200 °C."])
gamelle("Couscous de poulet aux légumes", 50, "volaille", [("Hauts de cuisse de poulet", 700, "g"), ("Semoule complète", 300, "g"), ("Carottes", 4, "pièce"), ("Courgettes", 2, "pièce"), ("Pois chiches", 1, "boîte"), ("Oignon", 1, "pièce"), ("Tomates concassées", 1, "boîte"), ("Ras el hanout",)],
    ["Dorer le poulet avec l'oignon et les épices.", "Ajouter carottes, tomates et 1 L d'eau, mijoter 25 min.", "Ajouter courgettes et pois chiches, 15 min.", "Préparer la semoule et répartir."])
gamelle("Tajine de poulet, carottes et pois chiches", 55, "volaille", [("Hauts de cuisse de poulet", 700, "g"), ("Carottes", 4, "pièce"), ("Pois chiches", 1, "boîte"), ("Oignon", 2, "pièce"), ("Citron", 1, "pièce"), ("Semoule complète", 300, "g"), ("Cumin",)],
    ["Dorer le poulet, ajouter les oignons émincés et le cumin.", "Ajouter les carottes, le jus du citron et 30 cl d'eau, mijoter 35 min.", "Ajouter les pois chiches 10 min.", "Servir avec la semoule."])
gamelle("Blanquette de dinde et riz", 45, "volaille", [("Escalopes de dinde", 600, "g"), ("Carottes", 4, "pièce"), ("Champignons", 250, "g"), ("Crème légère", 200, "mL"), ("Bouillon cube", 1, "pièce"), RIZ3],
    ["Faire revenir la dinde en cubes.", "Couvrir de bouillon, ajouter les carottes, cuire 20 min.", "Ajouter les champignons 10 min, puis la crème.", "Servir avec le riz."])
gamelle("Chili con carne à congeler", 50, "viande", [("Viande hachée 5 %", 600, "g"), ("Haricots rouges", 2, "boîte"), ("Tomates concassées", 2, "boîte"), ("Maïs doux", 1, "boîte"), ("Poivrons", 2, "pièce"), ("Oignon", 2, "pièce"), RIZ3, ("Cumin",), ("Paprika",)],
    ["Faire revenir les oignons, les poivrons et la viande.", "Ajouter épices, tomates, haricots et maïs, mijoter 30 min.", "Cuire le riz et répartir."])
gamelle("Riz cantonais au poulet", 30, "volaille", [("Escalopes de poulet", 400, "g"), RIZ3, ("Œufs", 3, "pièce"), ("Petits pois", 300, "g"), ("Carottes", 2, "pièce"), ("Oignon", 1, "pièce"), ("Sauce soja",)],
    ["Cuire le riz la veille ou le laisser refroidir.", "Faire une omelette fine, la couper en lanières.", "Sauter le poulet en dés, l'oignon, les carottes et les petits pois.", "Ajouter le riz et la sauce soja, puis l'omelette."])
gamelle("Poulet tikka masala et riz", 40, "volaille", [("Escalopes de poulet", 600, "g"), ("Yaourt grec", 2, "pot"), ("Tomates concassées", 1, "boîte"), ("Crème légère", 100, "mL"), ("Oignon", 1, "pièce"), RIZ3, ("Garam masala",)],
    ["Mariner le poulet en dés dans le yaourt et les épices.", "Faire revenir l'oignon, ajouter le poulet, puis les tomates, 15 min.", "Ajouter la crème, servir avec le riz."])
gamelle("Keftas de bœuf, semoule et courgettes", 40, "viande", [("Viande hachée 5 %", 500, "g"), ("Semoule complète", 300, "g"), ("Courgettes", 3, "pièce"), ("Yaourt grec", 2, "pot"), ("Oignon", 1, "pièce"), ("Cumin",)],
    ["Mélanger la viande, l'oignon haché et le cumin, former des keftas.", "Les cuire 10 min à la poêle.", "Poêler les courgettes en rondelles, préparer la semoule.", "Servir avec le yaourt en sauce (à part dans la boîte)."])
gamelle("Sauté de porc aux champignons et riz", 50, "viande", [("Sauté de porc", 530, "g"), ("Champignons", 400, "g"), ("Crème légère", 200, "mL"), ("Oignon", 1, "pièce"), RIZ3, ("Moutarde",)],
    ["Dorer le porc en morceaux avec l'oignon.", "Ajouter un verre d'eau et mijoter 30 min à couvert.", "Ajouter les champignons 10 min, puis la crème et une cuillère de moutarde.", "Servir avec le riz."])
gamelle("Ratatouille au poulet et quinoa", 50, "volaille", [("Escalopes de poulet", 500, "g"), ("Courgettes", 2, "pièce"), ("Aubergine", 1, "pièce"), ("Poivrons", 2, "pièce"), ("Tomates concassées", 1, "boîte"), ("Quinoa", 300, "g"), ("Oignon", 1, "pièce"), ("Herbes de Provence",)],
    ["Faire revenir les légumes en dés 10 min, ajouter les tomates et mijoter 25 min.", "Saisir le poulet en dés et l'ajouter.", "Cuire le quinoa et répartir."])
gamelle("Curry de colin au lait de coco et riz", 35, "poisson", [("Filets de colin", 600, "g"), ("Lait de coco", 1, "boîte"), ("Tomates concassées", 1, "boîte"), ("Épinards frais", 200, "g"), RIZ3, ("Oignon", 1, "pièce"), ("Curry",)],
    ["Faire revenir l'oignon avec le curry.", "Ajouter tomates et lait de coco, mijoter 10 min.", "Ajouter le colin en morceaux et les épinards, 8 min.", "Servir avec le riz."])
gamelle("Saucisses de volaille aux lentilles", 45, "volaille", [("Saucisses de volaille", 6, "pièce"), ("Lentilles vertes", 400, "g"), ("Carottes", 3, "pièce"), ("Oignon", 1, "pièce"), ("Bouillon cube", 1, "pièce"), ("Thym",)],
    ["Faire revenir l'oignon et les carottes en dés.", "Ajouter les lentilles, le bouillon et 3 fois leur volume d'eau, cuire 25 min.", "Ajouter les saucisses coupées 5 min avant la fin."])
gamelle("Bolognaise allégée bœuf et lentilles", 40, "viande", [("Viande hachée 5 %", 400, "g"), ("Lentilles corail", 150, "g"), ("Tomates concassées", 2, "boîte"), ("Carottes", 2, "pièce"), ("Oignon", 1, "pièce"), ("Pâtes complètes", 320, "g")],
    ["Faire revenir l'oignon, les carottes râpées et la viande.", "Ajouter les lentilles, les tomates et 30 cl d'eau, mijoter 20 min.", "Cuire les pâtes et répartir."])
gamelle("Curry de poulet aux pois chiches et épinards", 35, "volaille", [("Escalopes de poulet", 500, "g"), ("Pois chiches", 1, "boîte"), ("Épinards frais", 300, "g"), ("Lait de coco", 1, "boîte"), RIZ3, ("Oignon", 1, "pièce"), ("Curry",)],
    ["Faire revenir l'oignon et le poulet avec le curry.", "Ajouter le lait de coco et les pois chiches, mijoter 12 min.", "Ajouter les épinards jusqu'à ce qu'ils fondent.", "Servir avec le riz."])
gamelle("Paëlla légère poulet et crevettes", 45, "volaille", [("Escalopes de poulet", 400, "g"), ("Crevettes décortiquées", 200, "g"), RIZ3, ("Poivrons", 2, "pièce"), ("Petits pois", 200, "g"), ("Tomates concassées", 1, "boîte"), ("Oignon", 1, "pièce"), ("Curcuma",)],
    ["Dorer le poulet en dés avec l'oignon et les poivrons.", "Ajouter le riz, le curcuma, les tomates et 75 cl d'eau, cuire 18 min.", "Ajouter les petits pois et les crevettes 5 min avant la fin."])
gamelle("Gratin de courgettes au poulet et riz", 45, "volaille", [("Escalopes de poulet", 400, "g"), ("Courgettes", 4, "pièce"), ("Riz basmati", 200, "g"), ("Crème légère", 200, "mL"), ("Emmental râpé", 80, "g")],
    ["Cuire le riz. Poêler le poulet en dés et les courgettes en rondelles.", "Mélanger avec le riz et la crème dans un plat, parsemer d'emmental.", "Gratiner 20 min à 200 °C."])
gamelle("Soupe-repas au poulet, légumes et pâtes", 40, "volaille", [("Escalopes de poulet", 400, "g"), ("Carottes", 3, "pièce"), ("Poireaux", 2, "pièce"), ("Pâtes complètes", 150, "g"), ("Bouillon cube", 2, "pièce")],
    ["Faire revenir les poireaux et les carottes en rondelles.", "Ajouter 1,5 L d'eau et le bouillon, cuire 15 min.", "Ajouter le poulet en dés et les pâtes, cuire 10 min."])
gamelle("Quiche sans pâte au thon et courgettes", 45, "poisson", [("Thon au naturel", 2, "boîte"), ("Œufs", 5, "pièce"), ("Courgettes", 2, "pièce"), ("Lait demi-écrémé", 250, "mL"), ("Emmental râpé", 60, "g")],
    ["Poêler les courgettes râpées 5 min pour les sécher.", "Battre les œufs et le lait, ajouter le thon, les courgettes et l'emmental.", "Cuire 35 min à 180 °C dans un moule, découper en 4 parts."])

# ---------------- Dîners (2 portions) ----------------
P = ("Escalopes de poulet", 300, "g"); D = ("Escalopes de dinde", 300, "g"); RIZ = ("Riz basmati", 150, "g"); SAUMON = ("Pavés de saumon", 2, "pièce")
rec("Poulet au paprika, poivrons et semoule", 25, ["volaille"], [P, ("Poivrons", 2, "pièce"), ("Semoule complète", 150, "g"), ("Yaourt grec", 1, "pot"), ("Paprika",)],
    ["Saisir le poulet en lanières avec le paprika.", "Ajouter les poivrons émincés, cuire 8 min.", "Préparer la semoule, servir avec le yaourt."])
rec("Dinde au curry, haricots verts et riz", 25, ["volaille"], [D, ("Haricots verts", 300, "g"), RIZ, ("Crème légère", 100, "mL"), ("Curry",)],
    ["Cuire le riz et les haricots verts.", "Saisir la dinde en dés avec le curry, ajouter la crème."])
rec("Saumon sauce yaourt-concombre et pommes de terre", 30, ["poisson"], [SAUMON, ("Pommes de terre", 4, "pièce"), ("Yaourt grec", 1, "pot"), ("Concombre", 1, "pièce"), ("Aneth",)],
    ["Cuire les pommes de terre à la vapeur 20 min.", "Cuire le saumon 4 min par face.", "Mélanger yaourt, concombre râpé et aneth pour la sauce."])
rec("Saumon teriyaki, nouilles et légumes", 25, ["poisson"], [SAUMON, ("Nouilles de riz", 150, "g"), ("Carottes", 2, "pièce"), ("Courgette", 1, "pièce"), ("Sauce soja",), ("Miel",)],
    ["Réhydrater les nouilles.", "Saisir le saumon, ajouter sauce soja et miel pour laquer.", "Sauter les légumes en julienne, ajouter les nouilles."])
rec("Cabillaud rôti, purée de patate douce et épinards", 30, ["poisson"], [("Filets de cabillaud", 300, "g"), ("Patates douces", 2, "pièce"), ("Épinards frais", 150, "g")],
    ["Cuire les patates douces 20 min, écraser en purée.", "Rôtir le cabillaud 12 min à 200 °C.", "Faire tomber les épinards à la poêle."])
rec("Colin pané au four et haricots verts", 25, ["poisson"], [("Filets de colin", 300, "g"), ("Œufs", 1, "pièce"), ("Haricots verts", 300, "g"), ("Chapelure",)],
    ["Passer le colin dans l'œuf battu puis la chapelure, cuire 15 min à 200 °C.", "Cuire les haricots verts 8 min."])
rec("Crevettes sautées au brocoli et riz", 20, ["poisson"], [("Crevettes décortiquées", 250, "g"), ("Brocoli", 1, "pièce"), RIZ, ("Sauce soja",), ("Ail",)],
    ["Cuire le riz et le brocoli 5 min à la vapeur.", "Sauter les crevettes avec l'ail 3 min, ajouter le brocoli et la sauce soja."])
rec("Steak haché et purée de brocoli maison", 25, ["viande"], [("Steaks hachés 5 %", 2, "pièce"), ("Brocoli", 1, "pièce"), ("Pommes de terre", 2, "pièce")],
    ["Cuire brocoli et pommes de terre 20 min, mixer en purée.", "Cuire les steaks à la poêle."])
rec("Burger maison léger et frites de patate douce", 35, ["viande"], [("Steaks hachés 5 %", 2, "pièce"), ("Pains burger", 2, "pièce"), ("Tomates", 1, "pièce"), ("Salade verte", 1, "pièce"), ("Oignon rouge", 1, "pièce"), ("Patates douces", 2, "pièce")],
    ["Couper les patates douces en frites, les cuire 25 min à 200 °C.", "Cuire les steaks, garnir les pains de salade, tomate et oignon."])
rec("Fajitas de bœuf aux poivrons", 25, ["viande"], [("Émincé de bœuf", 300, "g"), ("Poivrons", 2, "pièce"), ("Oignon", 1, "pièce"), ("Tortillas complètes", 4, "pièce"), ("Mélange épices fajitas", 1, "sachet"), ("Yaourt grec", 1, "pot")],
    ["Saisir le bœuf 2 min à feu vif, réserver.", "Sauter poivrons et oignon avec les épices 6 min, remettre le bœuf.", "Garnir les tortillas, servir avec le yaourt."])
rec("Poulet grillé, salade de quinoa, concombre et feta", 25, ["volaille"], [P, ("Quinoa", 150, "g"), ("Concombre", 1, "pièce"), ("Tomates cerises", 150, "g"), ("Feta", 100, "g")],
    ["Cuire le quinoa et le laisser tiédir.", "Griller le poulet.", "Mélanger quinoa, concombre, tomates et feta, servir avec le poulet."])
rec("Escalopes de dinde aux champignons et pâtes complètes", 25, ["volaille"], [D, ("Champignons", 250, "g"), ("Crème légère", 100, "mL"), ("Pâtes complètes", 160, "g")],
    ["Cuire les pâtes.", "Saisir la dinde, réserver ; faire revenir les champignons 6 min.", "Ajouter la crème et la dinde, 2 min."])
rec("Saumon, lentilles vertes et carottes", 35, ["poisson"], [SAUMON, ("Lentilles vertes", 150, "g"), ("Carottes", 2, "pièce"), ("Échalote", 1, "pièce")],
    ["Cuire les lentilles 20 min avec les carottes en dés.", "Cuire le saumon 4 min par face.", "Assaisonner les lentilles avec l'échalote ciselée."])
rec("Frittata au poulet et épinards", 20, ["volaille"], [("Œufs", 5, "pièce"), ("Blanc de poulet", 4, "tranche"), ("Épinards frais", 150, "g"), ("Emmental râpé", 40, "g"), ("Salade verte", 1, "pièce")],
    ["Faire tomber les épinards dans une poêle.", "Ajouter le poulet en lanières et les œufs battus avec l'emmental.", "Cuire 10 min à feu doux à couvert. Servir avec la salade."])
rec("Wok de bœuf au brocoli", 20, ["viande"], [("Émincé de bœuf", 300, "g"), ("Brocoli", 1, "pièce"), RIZ, ("Sauce soja",), ("Gingembre",)],
    ["Cuire le riz.", "Saisir le bœuf 2 min, réserver.", "Sauter le brocoli 5 min, remettre le bœuf avec la sauce soja et le gingembre."])
rec("Crevettes à la provençale et riz", 25, ["poisson"], [("Crevettes décortiquées", 250, "g"), ("Tomates concassées", 1, "boîte"), ("Courgette", 1, "pièce"), RIZ, ("Ail",), ("Herbes de Provence",)],
    ["Cuire le riz.", "Faire revenir la courgette en dés avec l'ail, ajouter les tomates, 10 min.", "Ajouter les crevettes 4 min."])
rec("Cuisses de poulet aux herbes, haricots verts et pommes de terre", 50, ["volaille"], [("Cuisses de poulet", 2, "pièce"), ("Haricots verts", 300, "g"), ("Pommes de terre", 3, "pièce"), ("Herbes de Provence",)],
    ["Rôtir les cuisses et les pommes de terre en quartiers 45 min à 200 °C.", "Cuire les haricots verts 8 min."])
rec("Lieu noir au four et ratatouille express", 35, ["poisson"], [("Filets de lieu noir", 300, "g"), ("Courgette", 1, "pièce"), ("Aubergine", 1, "pièce"), ("Poivron", 1, "pièce"), ("Tomates", 2, "pièce")],
    ["Faire revenir les légumes en dés 20 min.", "Cuire le poisson 12 min à 200 °C sur les légumes."])
rec("Brochettes de poulet, sauce yaourt et boulgour", 30, ["volaille"], [P, ("Boulgour", 150, "g"), ("Yaourt grec", 1, "pot"), ("Courgette", 1, "pièce"), ("Oignon rouge", 1, "pièce")],
    ["Monter les brochettes poulet, courgette et oignon.", "Les griller 12 min.", "Cuire le boulgour, servir avec le yaourt assaisonné."])
rec("Salade tiède de saumon, pommes de terre et haricots verts", 30, ["poisson"], [SAUMON, ("Pommes de terre", 3, "pièce"), ("Haricots verts", 200, "g"), ("Salade verte", 1, "pièce"), ("Moutarde",)],
    ["Cuire pommes de terre et haricots verts.", "Cuire le saumon et l'émietter.", "Assembler sur la salade avec une vinaigrette à la moutarde."])
rec("Bowl de bœuf à la coréenne", 25, ["viande"], [("Viande hachée 5 %", 300, "g"), RIZ, ("Carottes", 2, "pièce"), ("Concombre", 1, "pièce"), ("Œufs", 2, "pièce"), ("Sauce soja",), ("Gingembre",)],
    ["Cuire le riz.", "Saisir la viande avec la sauce soja et le gingembre.", "Cuire les œufs au plat.", "Dresser avec carottes râpées et concombre."])
rec("Poulet milanaise au four et spaghetti complets", 30, ["volaille"], [P, ("Œufs", 1, "pièce"), ("Pâtes complètes", 160, "g"), ("Tomates concassées", 1, "boîte"), ("Chapelure",)],
    ["Paner le poulet (œuf, chapelure), cuire 18 min à 200 °C.", "Cuire les pâtes, réchauffer les tomates assaisonnées."])
rec("Papillote de cabillaud aux petits légumes et quinoa", 30, ["poisson"], [("Filets de cabillaud", 300, "g"), ("Courgette", 1, "pièce"), ("Carottes", 2, "pièce"), ("Quinoa", 150, "g"), ("Citron", 1, "pièce")],
    ["Cuire le quinoa.", "Fermer en papillote cabillaud, légumes en julienne et citron, cuire 15 min à 200 °C."])
rec("Poulet au curry et chou-fleur rôti", 35, ["volaille"], [P, ("Chou-fleur", 1, "pièce"), ("Yaourt grec", 1, "pot"), RIZ, ("Curry",)],
    ["Rôtir le chou-fleur en fleurettes avec le curry 25 min à 200 °C.", "Cuire le riz et le poulet en dés.", "Napper de yaourt au curry."])
rec("Steak de bœuf, champignons poêlés et patate douce", 35, ["viande"], [("Steaks de bœuf", 2, "pièce"), ("Champignons", 250, "g"), ("Patates douces", 2, "pièce")],
    ["Rôtir les patates douces en cubes 25 min.", "Poêler les champignons 8 min.", "Cuire les steaks selon la cuisson voulue."])

# Prix relevés au Carrefour Market Rive-de-Gier le 03/11/2026 pour les nouveaux ingrédients
PRIX = [
 ("Bœuf à mijoter", 9.76, 620, "g", "Bœuf bourguignon à mijoter Atelier de Gustave 620 g", False),
 ("Hauts de cuisse de poulet", 3.39, 700, "g", "Hauts de cuisses de poulet Petit Prix 700 g", False),
 ("Feuilles de lasagne", 2.09, 250, "g", "Feuilles de lasagnes fraîches Carrefour Classic' 250 g", False),
 ("Semoule complète", 1.95, 500, "g", "Couscous semi-complet Carrefour Bio 500 g", False),
 ("Petits pois", 1.79, 1000, "g", "Petits pois très fins Carrefour Classic' 1 kg (surgelé)", False),
 ("Sauté de porc", 5.14, 530, "g", "Sauté de porc sans os Atelier de Gustave 530 g", False),
 ("Aubergine", 1.49, 1, "pièce", "Aubergine à la pièce", False),
 ("Saucisses de volaille", 1.69, 10, "pièce", "Knacki 100 % poulet Herta x10", False),
 ("Pains burger", 0.99, 6, "pièce", "Pains burger Carrefour Classic' x6", False),
 ("Chou-fleur", 1.35, 2, "pièce", "Chou-fleur en fleurettes Simpl 1 kg (surgelé)", False),
]

if __name__ == "__main__":
    q = lambda s: "'" + s.replace("'", "''") + "'"
    data = json.dumps(R, ensure_ascii=False, separators=(",", ":"))
    prix = ",\n".join(f"({q(n)},{p},{qq},{q(u)},{q(prod)},{'true' if e else 'false'})" for n, p, qq, u, prod, e in PRIX)
    print(f"""insert into prix_ingredients (foyer_id, nom, prix, quantite, unite, produit, estime)
select f.id, v.* from (select id from foyers order by cree_le limit 1) f, (values
{prix}
) v(nom, prix, quantite, unite, produit, estime)
on conflict (foyer_id, nom) do update set prix = excluded.prix, quantite = excluded.quantite, unite = excluded.unite, produit = excluded.produit, estime = excluded.estime, maj = current_date;
with data as (select $j${data}$j$::jsonb d),
foyer as (select id from foyers order by cree_le limit 1),
src as (select e from data, jsonb_array_elements(d) e),
ins as (
  insert into recettes (foyer_id, nom, portions, temps_min, etapes, tags, source)
  select foyer.id, e->>'n', (e->>'p')::int, (e->>'t')::int, e->>'e', array(select jsonb_array_elements_text(e->'g')), 'claude'
  from src, foyer where not exists (select 1 from recettes r where r.foyer_id = foyer.id and r.nom = e->>'n')
  returning id, nom
)
insert into recette_ingredients (recette_id, nom, quantite, unite, ordre)
select ins.id, i.v->>0, (i.v->>1)::numeric, i.v->>2, i.n - 1
from ins join src on src.e->>'n' = ins.nom
cross join lateral jsonb_array_elements(src.e->'i') with ordinality as i(v, n);""")
