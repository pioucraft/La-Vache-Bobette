const marked = require("marked")
import 'dotenv/config'

const express = require("express")
const cors = require("cors")
const app = express()
app.use(cors())
const bodyParser = require("body-parser")
const jsonMiddleware = bodyParser.json({ type: 'application/json' });
app.use(jsonMiddleware)

app.use((req, res, next) => {
    
    console.log(`Access to : ${req.url}`);
    
    next();
});

const multer = require("multer")
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, __dirname + "/public/images/");
    },
    filename: function (req, file, cb) {
        const originalExtension = path.extname(file.originalname);
        let fileName = crypto.randomUUID()
        cb(null, fileName + originalExtension)
    }
});
  
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg" ||
        file.mimetype == "image/gif" ||
        file.mimetype == "image/webp"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error("Only .png, .jpg, .jpeg, .gif and .webp format allowed!"));
      }
    },
    limits: { fileSize: 15000000 },
});

const indexHtml = Bun.file(`${__dirname}/templates/index.html`)
const journalHtml = Bun.file(`${__dirname}/templates/journal.html`)
const journauxHtml = Bun.file(`${__dirname}/public/journaux.html`)

app.post("/api/post", async (req, res) => {
    let token = req.body.token
    let content = req.body.content.join("\n") 
    if(token == process.env.TOKEN) {
        let htmlContent = marked.parse(content)
        const fileName = crypto.randomUUID()
        Bun.write(`${__dirname}/public/journal/${fileName}.html`, (await Bun.readableStreamToText(journalHtml.stream())).replaceAll("#htmlContent", htmlContent).replaceAll("#title", req.body.title))
        Bun.write(`${__dirname}/public/index.html`, (await Bun.readableStreamToText(indexHtml.stream())).replaceAll("#title", req.body.title).replaceAll("#description", req.body.description).replaceAll("#imgSrc", req.body.img).replaceAll("#link", `journal/${fileName}.html`))
        Bun.write(`${__dirname}/public/journaux.html`, (await Bun.readableStreamToText(journauxHtml.stream())).replaceAll("<!-- #article -->", `<!-- #article --><div class="new" onclick="location.href='journal/${fileName}.html'"><img src="${req.body.img}" alt="Image d'illustration"><div class="texts"><h2>${req.body.title}</h2><p>${req.body.description}</p></div></div>\n`))
        res.send({"link": `${fileName}.html`})
    }
    else {
        res.sendStatus(401)
    }
})

app.post("/api/post-image/:token", async (req, res) => {
    console.log(req.params.token)
    console.log(process.env.TOKEN)
    if(req.params.token == process.env.TOKEN) {
        
        const uploadMiddleware = await upload.single("files");
        uploadMiddleware(req, res, async (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'File upload failed.' });
            } else {
                // Send the filename in the response
                const filename = req.file.filename;
                console.log(filename)
                res.status(200).json({ filename: filename });
            }
        })
    }
    else {
        res.sendStatus(401)
    }
})

app.use(express.static("public"))

app.listen(Number(process.env.PORT))

//fetch("http://localhost:3036/api/post", {method: "POST", body: '{"test": "te"}', headers: {"Content-Type": "application/json"}})