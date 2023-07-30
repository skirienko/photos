
require('dotenv').config();
const MiniSearch = require('minisearch');
const express = require('express');

const docs = require(process.env.DOCPATH+'/docs.json'); 

let ms = new MiniSearch({
    fields: ['title', 'descr'],
    storeFields: ['title', 'descr', 'photo', 'path', 'hash'],
});

ms.addAll(docs);
console.log(`${ms.documentCount} docs, ${ms.termCount} terms`);

const app = express();

const PORT = 5005;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
  
app.get("/search", (req, res) => {
    if (req.query && req.query.q) {
        const q = req.query.q;
        console.debug("Searching for: "+q);
        res.json(ms.search(q));
    }
    else
        res.json([]);
});


app.listen(PORT, () => {
    console.log(`MiniSearch started on port ${PORT}`);
})