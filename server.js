const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Crée le dossier "uploads" si inexistant
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuration de Multer pour stocker les fichiers dans "uploads"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Autoriser CORS pour ton extension
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // ou ton URL d'extension
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// Route pour uploader les images
app.post("/upload", upload.array("photos", 20), (req, res) => {
    if (!req.files) {
        return res.status(400).json({ error: "Aucun fichier reçu" });
    }

    const urls = req.files.map(file => {
        // URL publique pour chaque image
        return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
    });

    res.json({ urls });
});

// Rendre le dossier uploads accessible publiquement
app.use("/uploads", express.static(uploadDir));

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
