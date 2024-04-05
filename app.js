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
const port = 3000;


app.set("view engine", "ejs");
app.use(express.static('public'));

// Выше используемые библиотеки

app.get("/", (req, res) => {
    res.render("index");
});

// Показывает локальную ссылку на сайт

app.listen(port, ()=>{
    console.log(`Твой сервак запущен тут http://localhost:${port}, только тихо))`)
});

// переходы

app.get("/about", (req,res) =>{
    res.sendFile('C:\\Users\\baba_yaga0\\Desktop\\Alexandria_node\\public\\about_us.html')
});

app.get("/my_product", (req, res) => {
    res.sendFile('C:\\Users\\baba_yaga0\\Desktop\\Alexandria_node\\public\\ready_sets.html')

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

app.get("/admin_panel", (req, res) => {
    res.sendFile('C:\\Users\\baba_yaga0\\Desktop\\Alexandria_node\\public\\admin_panel.html')
})

// Ниже авторизация и регистрация и всё что к этому надо


// подключение к бдшке
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "Alexandria",
});

// midlleware сессии
app.use(session({
    secret: "dontcarewhatwrotethis",
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 60 * 60 * 12}, //12 часов
    resave: true
}));

app.use(cookieParser()); // используется для разбора и составления HTTP-куки, позволяя Node.js работать с куками, отправленными клиентом

// Забор данных с формы и регистрация
// Важно не ошибится с {} и прочим отделением ВНИМАТЕЛЬНИЕ создатель
// вставка данных в БД в момент регистрации

app.post('/register', encodeUrl, (req, res) => {
        var firstname = req.body.firstName;
        var surname = req.body.Surname;
        var login = req.body.Login;
        var password = req.body.Password;

        connection.connect(function(err) {
            if(err){
                console.log(err)
            }

        // Проверка на наличие пользователя в БД
        connection.query(`SELECT * FROM Users WHERE login = '${login}' AND password = '${password}'`, function(err,result){
            if(err){
                console.log(err)
            };
            if(Object.keys(result).length > 0){
                res.sendFile('C:\\Users\\baba_yaga0\\Desktop\\Alexandria_node\\public\\FailReg.html');
            }else{
                function userPage(){
                    req.session.user = {
                        firstname: firstname,
                        surname: surname,
                        login: login,
                        password: password
                    };
                    res.redirect('/personal_office')
                }
                var sql = `INSERT INTO Users (firstname, surname, login, password ) VALUES ('${firstname}', '${surname}', '${login}', '${password}')`;
                    connection.query(sql, function (err, result) {
                        if(err){
                            console.log(err)
                        }else{
                            userPage();
                        };
                    });
            }
        });//96 строка 
    });// с 90 строки
}); //84 cтрока




//Авторизация юзера на сайте 
// проверка и прочее в блоке ниже как и с регистрацией
app.post("/personal_office", encodeUrl, (req, res) => {
    // забор данных с формы при авторизации 
    var userLogin = req.body.login_from_user;
    var userPassword = req.body.password_from_user;
    
    // проверка 
    connection.connect(function(err) {
        if(err){
            document.writeln("Неправильные введёные данные")
        };

        connection.query(`SELECT * FROM users where login = '${userLogin}' AND password = '${userPassword}'`, function (err, result){
            if(err){
                res.sendFile('C:\\Users\\baba_yaga0\\Desktop\\Alexandria_node\\public\\FailAuth.html');
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
                res.sendFile('C:\\Users\\baba_yaga0\\Desktop\\Alexandria_node\\public\\FailAuth.html');
            }
        });
    })
});


// обработка заказов из бд для отображения в админ-панели

app.post('/orders_users', (req,res ) =>{
    connection.connect(err => {
        if(err){
            return res.status(500).send({error: 'Ошибка подключения к базе данных'})
        }

        const query = `SELECT * FROM orders`;

        connection.query(query, (err, results) => {
            if(err){
                console.log("ошибка выполения запроса")
            }
        
            res.send({ orders: results });
        });
    })
})

// 

/*

// После успешной авторизации устанавливаем имя пользователя в переменную сессии
req.session.username = user.username

// На каждой странице проверяем, есть ли переменная сессии с именем пользователя
if (req.session && req.session.username) {
  // Выводим имя пользователя
  console.log(`Привет, ${req.session.username}!`);
} else {
  // Если переменной сессии нет, выводим сообщение об отсутствии авторизации
  console.log("Вы не авторизованы");
}
/
*/
