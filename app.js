const express = require("express");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const http = require('http');
const parseUrl = require('body-parser');
const app = express();

const mysql = require("mysql");
const { encode } = require('punycode');


let encodeUrl = parseUrl.urlencoded({ extended: false });

const path = require("path");
const port = 4000;


app.set("view engine", "ejs");
app.use(express.static('public'));

// Выше используемые библиотеки

app.get("/", (req, res) => {
    res.render("index");
});

// Показывает локальную ссылку на сайт

app.listen(port, ()=>{
    console.log(`Твой сервак запущен тут http:localhost:${port}, только тихо))`)
});

// переходы

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

app.get("/personal_office", (req, res) => {
    res.sendFile('C:\\Users\\baba_yaga0\\Desktop\\Alexandria_node\\public\\personal_office.html')
})

// Ниже авторизация и регистрация и всё что к этому надо


// подключение к бдшке
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "Alexandria",
});

// проверка на соединение, если возникла ошибка срабатывает данная функция
connection.connect(function(err){
    if(err){
        console.log(err)
    };


// midlleware сессии
app.use(session({
    secret: "dontcarewhatwrotethis",
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 60 * 60 * 12}, //12 часов
    resave: false
}));

app.use(cookieParser()); // используется для разбора и составления HTTP-куки, позволяя Node.js работать с куками, отправленными клиентом

// Забор данных с формы и регистрация
    app.post('/register', encodeUrl, (req, res) => {
        var firstname = req.body.firstname;
        var surname = req.body.surname;
        var mail = req.body.mail;
        var login = req.body.login;
        var password = req.body.password;

        // проверка на то что есть ли данные такого юзера в бдшке или нету
    connection.query(`SELECT * FROM Users WHERE firstname = '${firstname}' AND surname = '${surname}'`), function(err, result){
        if(err){
            console.log(err)
        };
        if(Object.keys(result).length > 0){
            console.log("ошибка при регистрации, такое пользователь скорее всего существует") // можно заменить на страницу с ошибчной регистрацией res.sendFile(__dirname + '/failReg.html');
        }else{
            // страница пользователя
            function userPage(){
                req.session.user = {
                    firstname: firstname,
                    surname: surname,
                    login: login,
                    password: password
                };

                res.redirect('/personal_office')
            }

            // Важно не ошибится с {} и прочим отделением ВНИМАТЕЛЬНИЕ создатель
            // вставка данных в БД в момент регистрации
            var sql = `INSERT INTO Users (firstname, surname, mail, login, password) VALUES ('${firstname}', '${surname}','${mail}', '${login}','${password}')`;
            connection.query(sql, function(err, result){
                if(err){
                    console.log(err)
                }else{
                    userPage()
                }
                })
            }
        }
    });

})

//Авторизация юзера на сайте 


// проверку и прочее в блок ниже как и с регом
app.post("/personal_office", encodeUrl, (req, res) => {
    // забор данных с формы при авторизации 
    var userLogin = req.body.login_from_user;
    var userPassword = req.body.password_from_user;
    
    // проверка 
    connection.connect(function(err) {
        if(err){
            console.log("Неправильные введёные данные")
        };

        connection.query(`SELECT * FROM users where login = '${userLogin}' AND password = '${userPassword}'`, function (err, result){
            if(err){
                console.log("Такого юзера нету, досвидание")
            };
            function userPage(){
                // создание ссесии для юзера и хранение его инфы
                req.session.user = {
                    firstname: result[0].firstname,
                    surname: result[0].surname,
                    login: login,
                    password: password
                };
                    res.redirect('/personal_office')
            }
            if(Object.keys(result).length > 0){
                userPage();
            }else{
                console.log("Ошибка при авторизации, такого юзера не существует")
            }
        });
    })
});