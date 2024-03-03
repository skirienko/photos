
require('dotenv').config();
const MiniSearch = require('minisearch');
const express = require('express');
const fs = require('fs');

const DOCS_FILE = process.env.DOCPATH+'docs.json';
const docs = require(DOCS_FILE); 

let ms = new MiniSearch({
    fields: ['title', 'descr'],
    storeFields: ['title', 'descr', 'photo', 'path', 'hash'],
});

ms.addAll(docs);
console.log(`${ms.documentCount} docs, ${ms.termCount} terms`);

fs.watch(DOCS_FILE, async (eventType) => {
    console.log(eventType);
    if (eventType === 'change') {
        setTimeout(updateDocs, 1000);
    }
});

async function updateDocs() {
    fs.readFile(DOCS_FILE, "utf-8", async (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            const dd = await JSON.parse(data);
            if (dd && dd.length > 100) {
                console.log(`Replacing docs with newer ${dd.length} items`);
                ms.removeAll();
                ms.addAll(dd);
            }
        }
    });
}

const app = express();

const PORT = 5005;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
  
app.get("/api/search", (req, res) => {
    if (req.query && req.query.q) {
        const q = req.query.q;
        console.debug("Searching for: "+q);
        res.json(ms.search(q, {fuzzy:.2}));
    }
    else
        res.json([]);
});


app.listen(PORT, () => {
    console.log(`MiniSearch started on port ${PORT}`);
})