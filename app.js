const express = require("express");
const app = express();
const port = 3000;
const path = require("path");

app.set("view engine", "ejs");
app.use(express.static('public'));


app.get("/", (req, res) => {
    res.render("index");
});

app.listen(port, ()=>{
    console.log(`Твой сервак запущен тут http:localhost:${port}, только тихо))`)
});


app.get("/about", (req,res) =>{
    res.send("О нас вы тут инфы не найдете")
});

app.get("/my_product", (req, res) => {
    res.send("В процессе верстки")
});

app.get("/registration", (req, res) => {
    res.sendFile('C:\\Users\\baba_yaga0\\Desktop\\Alexandria_node\\public\\registration_auth.html')
});