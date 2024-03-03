const app = express();
const express = require("express");
const sessions = require('express-session');
const port = 3000;
// const path = require("path");
const mysql = require("mysql");

var parseUrl = require('body-parser');
const { session } = require("express-session");
const { encode } = require('punycode');


let encodeUrl = parseUrl.urlencoded({ extended: false });

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

// Забор данных с формы
app.post('/register', encodeUrl, (req, res) => {
    var firstName = req.body.firstName;
    var surName = req.body.surName;
    var mail = req.body.mail;
    var login = req.body.login;
    var password = req.body.password;

    
});

// midlleware сессии
app.use(session({
    secret: "dontcarewhatwrotethis",
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 60 * 60 * 12}, //12 часов
    resave: false
}));

app.use(cookieParser()); // используется для разбора и составления HTTP-куки, позволяя Node.js работать с куками, отправленными клиентом

// проверка на соединение, если возникла ошибка срабатывает данная функция
connection.connect(function(err){
    if(err){
        document.writeln(err)
    };

// проверка на то что есть ли данные такого юзера в бдшке или нету
    connection.query(`SELECT * FROM users WHERE username = '${userName}' AND password = '${surName}'`), function(err, result){
        if(err){
            document.writeln(err)
        };
        if(Object.keys(result).length > 0){
            document.writeln("ошибка при регистрации, такое пользователь скорее всего существует") // можно заменить на страницу с ошибчной регистрацией res.sendFile(__dirname + '/failReg.html');
        }else{
            // страница пользователя
            function userPage(){
                req.Session.user = {
                    firstname: firstName,
                    surname: surName,
                    login: login,
                    password: password
                };

                res.redirect('/personal_office')
            }

            // Важно не ошибится с {} и прочим отделением ВНИМАТЕЛЬНИЕ создатель
            // вставка данных в БД в момент регистрации
            var sql = `INSERT INTO users (firstname, surname, mail, login, password) VALUES ('${firstname}', '${surName}','${mail}', '${login}','${password}')`;
            connection.query(sql, function(err, result){
                if(err){
                    document.writeln(err)
                }else{
                    userPage()
                }
            })
        }
    }
})

//Авторизация юзера на сайте 

app.post("/personal_office", encodeUrl, (req, res) => {
    // забор данных с формы при авторизации 
    var userLogin = req.body.login_from_user;
    var userPassword = req.body.password_from_user;
    
    // проверка 
    connection.connect(function(err) {
        if(err){
            document.writeln("Неправильные введёные данные")
        };

        connection.query(`SELECT * FROM users where login = '${login_from_user}' AND password = '${password_from_user}'`, function (err, result){
            if(err){
                document.writeln("Такого юзера нету, досвидание")
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
                document.writeln("Ошибка при авторизации, такого юзера не существует")
            }
        });
    })
});