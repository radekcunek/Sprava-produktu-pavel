// Soubor obsahuje všechny API routy pro práci s produkty
// Každá routa odpovídá jedné HTTP metodě a URL adrese

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Cesta k JSON souboru, který slouží jako naše databáze
const dataPath = path.join(__dirname, "../data/products.json");

// Pomocná funkce pro načtení produktů ze souboru
function nactiProdukty() {
  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data);
}

// Pomocná funkce pro uložení produktů zpět do souboru
function ulozProdukty(produkty) {
  fs.writeFileSync(dataPath, JSON.stringify(produkty, null, 2), "utf-8");
}

// =====================================================
// ENDPOINT 1: GET /api/products
// Vrátí seznam všech produktů, volitelně filtrovaných
// =====================================================
router.get("/", (req, res) => {
  try {
    let produkty = nactiProdukty();

    // Filtrování podle kategorie – pokud je parametr zadán, vyfiltrujeme odpovídající produkty
    if (req.query.kategorie) {
      produkty = produkty.filter(
        (p) => p.kategorie.toLowerCase() === req.query.kategorie.toLowerCase()
      );
    }

    // Fulltextové vyhledávání v názvu a popisu produktu
    if (req.query.hledat) {
      const hledanyText = req.query.hledat.toLowerCase();
      produkty = produkty.filter(
        (p) =>
          p.nazev.toLowerCase().includes(hledanyText) ||
          p.popis.toLowerCase().includes(hledanyText)
      );
    }

    // Filtrování podle minimální ceny
    if (req.query.minCena) {
      produkty = produkty.filter(
        (p) => p.cena >= parseFloat(req.query.minCena)
      );
    }

    // Filtrování podle maximální ceny
    if (req.query.maxCena) {
      produkty = produkty.filter(
        (p) => p.cena <= parseFloat(req.query.maxCena)
      );
    }

    res.json(produkty);
  } catch (err) {
    res.status(500).json({ chyba: "Chyba při načítání produktů", detail: err.message });
  }
});

// =====================================================
// ENDPOINT 2: GET /api/products/:id
// Vrátí jeden konkrétní produkt podle jeho ID
// =====================================================
router.get("/:id", (req, res) => {
  try {
    const produkty = nactiProdukty();

    // Hledáme produkt se shodným ID z URL parametru
    const produkt = produkty.find((p) => p.id === req.params.id);

    if (!produkt) {
      return res.status(404).json({ chyba: "Produkt nebyl nalezen" });
    }

    res.json(produkt);
  } catch (err) {
    res.status(500).json({ chyba: "Chyba při načítání produktu", detail: err.message });
  }
});

// =====================================================
// ENDPOINT 3: POST /api/products
// Vytvoří nový produkt a uloží ho do databáze
// =====================================================
router.post("/", (req, res) => {
  try {
    const { nazev, kategorie, cena, mnozstvi, popis } = req.body;

    // Validace – kontrolujeme, zda jsou vyplněna všechna povinná pole
    if (!nazev || !kategorie || cena === undefined || mnozstvi === undefined) {
      return res.status(400).json({ chyba: "Chybí povinná pole: nazev, kategorie, cena, mnozstvi" });
    }

    // Validace číselných hodnot – cena a množství musí být kladná čísla
    if (isNaN(cena) || cena < 0) {
      return res.status(400).json({ chyba: "Cena musí být kladné číslo" });
    }
    if (isNaN(mnozstvi) || mnozstvi < 0) {
      return res.status(400).json({ chyba: "Množství musí být kladné číslo" });
    }

    const produkty = nactiProdukty();

    // Vytvoříme nový objekt produktu s unikátním ID a dnešním datem
    const novyProdukt = {
      id: uuidv4(),
      nazev: nazev.trim(),
      kategorie: kategorie.trim(),
      cena: parseFloat(cena),
      mnozstvi: parseInt(mnozstvi),
      popis: popis ? popis.trim() : "",
      datumPridani: new Date().toISOString().split("T")[0],
    };

    produkty.push(novyProdukt);
    ulozProdukty(produkty);

    // Odpovíme kódem 201 (Created) a vrátime nově vytvořený produkt
    res.status(201).json(novyProdukt);
  } catch (err) {
    res.status(500).json({ chyba: "Chyba při vytváření produktu", detail: err.message });
  }
});

// =====================================================
// ENDPOINT 4: PUT /api/products/:id
// Aktualizuje existující produkt – přepíše jeho data
// =====================================================
router.put("/:id", (req, res) => {
  try {
    const { nazev, kategorie, cena, mnozstvi, popis } = req.body;

    // Znovu validujeme povinná pole
    if (!nazev || !kategorie || cena === undefined || mnozstvi === undefined) {
      return res.status(400).json({ chyba: "Chybí povinná pole: nazev, kategorie, cena, mnozstvi" });
    }

    if (isNaN(cena) || cena < 0) {
      return res.status(400).json({ chyba: "Cena musí být kladné číslo" });
    }
    if (isNaN(mnozstvi) || mnozstvi < 0) {
      return res.status(400).json({ chyba: "Množství musí být kladné číslo" });
    }

    let produkty = nactiProdukty();

    // Najdeme index produktu v poli
    const index = produkty.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ chyba: "Produkt nebyl nalezen" });
    }

    // Aktualizujeme data – zachováme původní ID a datum přidání
    produkty[index] = {
      ...produkty[index],
      nazev: nazev.trim(),
      kategorie: kategorie.trim(),
      cena: parseFloat(cena),
      mnozstvi: parseInt(mnozstvi),
      popis: popis ? popis.trim() : "",
    };

    ulozProdukty(produkty);
    res.json(produkty[index]);
  } catch (err) {
    res.status(500).json({ chyba: "Chyba při aktualizaci produktu", detail: err.message });
  }
});

// =====================================================
// ENDPOINT 5: DELETE /api/products/:id
// Odstraní produkt ze seznamu podle jeho ID
// =====================================================
router.delete("/:id", (req, res) => {
  try {
    let produkty = nactiProdukty();

    // Zkontrolujeme, jestli produkt vůbec existuje
    const existuje = produkty.some((p) => p.id === req.params.id);

    if (!existuje) {
      return res.status(404).json({ chyba: "Produkt nebyl nalezen" });
    }

    // Odfiltrujeme mazaný produkt a uložíme zbytek
    produkty = produkty.filter((p) => p.id !== req.params.id);
    ulozProdukty(produkty);

    res.json({ zprava: "Produkt byl úspěšně smazán" });
  } catch (err) {
    res.status(500).json({ chyba: "Chyba při mazání produktu", detail: err.message });
  }
});

module.exports = router;
