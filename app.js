const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const mysql = require("mysql");
var parseUrl = require('body-parser');
const { Session } = require("inspector");

let encodeUrl = parseUrl.urlencoded({ extended: false });

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

app.get("/authorization", (req, res) => {
    res.sendFile('C:\\Users\\baba_yaga0\\Desktop\\Alexandria_node\\public\\authorization.html')
})


// Ниже авторизация и регистрация и всё что к этому надо


// подключение к бдшке
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "Alexandria",
});

// Забор данных с формы
app.post('/register', encodeUrl, (req, res) => {
    var firstName = req.body.firstName;
    var surName = req.body.surName;
    var mail = req.body.mail;
    var login = req.body.login;
    var password = req.body.password;

    
});

// midlleware сессии
app.use(Session({
    secret: "dontcarewhatwrotethis",
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 60 * 60 * 12}, //12 часов
    resave: false
}));

app.use(cookieParser()); // используется для разбора и составления HTTP-куки, позволяя Node.js работать с куками, отправленными клиентом


