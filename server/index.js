// Hlavní soubor serveru – tady Express aplikace "startuje"
// Registrujeme middleware, routy a nastavujeme port

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware: cors umožňuje frontendové aplikaci (na jiném portu) volat naše API
// Bez toho by prohlížeč zablokoval všechny requesty z Reactu
app.use(cors());

// Middleware: parsuje JSON tělo requestu, abychom mohli číst req.body
app.use(express.json());

// Importujeme routy pro produkty a namontujeme je na cestu /api/products
const productRoutes = require("./routes/products");
app.use("/api/products", productRoutes);

// Základní routa pro ověření, že server běží správně
app.get("/", (req, res) => {
  res.json({
    zprava: "Správce produktů API běží",
    endpointy: [
      "GET    /api/products            – seznam produktů (filtrovatelný)",
      "GET    /api/products/:id        – jeden produkt",
      "POST   /api/products            – vytvoření produktu",
      "PUT    /api/products/:id        – úprava produktu",
      "DELETE /api/products/:id        – smazání produktu",
    ],
  });
});

// Spustíme server na zadaném portu a vypíšeme potvrzení do konzole
app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
  console.log(`API dostupné na http://localhost:${PORT}/api/products`);
});
