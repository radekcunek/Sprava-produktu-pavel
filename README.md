# Správce produktů

Fullstack webová aplikace pro správu produktového skladu.

## Technologie
- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Databáze:** JSON soubor (file-based storage)

## Struktura projektu
```
spravce-produktu/
├── client/          # React frontend (port 3000)
│   └── src/
│       ├── components/
│       │   ├── ProductList.jsx
│       │   ├── ProductCard.jsx
│       │   ├── ProductForm.jsx
│       │   └── ProductFilter.jsx
│       ├── App.jsx
│       └── App.css
└── server/          # Express backend (port 5000)
    ├── routes/
    │   └── products.js
    ├── data/
    │   └── products.json
    └── index.js
```

## API Endpointy

| Metoda | URL | Popis |
|--------|-----|-------|
| GET | `/api/products` | Seznam produktů (filtrovatelný) |
| GET | `/api/products/:id` | Jeden produkt |
| POST | `/api/products` | Vytvoření produktu |
| PUT | `/api/products/:id` | Úprava produktu |
| DELETE | `/api/products/:id` | Smazání produktu |

### Query parametry pro filtrování (GET /api/products)
- `?hledat=text` – fulltextové hledání v názvu a popisu
- `?kategorie=Elektronika` – filtr podle kategorie
- `?minCena=1000` – minimální cena
- `?maxCena=5000` – maximální cena

## Spuštění

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Aplikace poté běží na **http://localhost:3000**

## Funkce aplikace
- Zobrazení produktů v responzivní kartové mřížce
- Filtrování podle textu, kategorie a cenového rozsahu
- Přidání nového produktu přes formulář s validací
- Úprava existujícího produktu
- Smazání produktu s potvrzením
- Statistiky (počet produktů, kusů, průměrná cena, počet kategorií)
- Barevné označení dostupnosti (Skladem / Málo skladem / Vyprodáno)
