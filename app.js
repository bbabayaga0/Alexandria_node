const express = require("express");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const http = require('http');
const parseUrl = require('body-parser');
const app = express();

const mysql = require("mysql");
const Joi = require('joi');
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


// подключение к бд
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
}); //85 cтрока




//Авторизация 
app.post("/authorization_users", encodeUrl, (req, res) => {
    // забор данных с формы при авторизации 
    var userLogin = req.body.login_from_user;
    var userPassword = req.body.password_from_user;
    
    // проверка 
    connection.connect(function(err) {
        if(err){
            console.log(err)
        };

        connection.query(`SELECT * FROM Users WHERE login = '${userLogin}' AND password = '${userPassword}'`, function (err, result){
            if(err){
                res.sendFile('C:\\Users\\baba_yaga0\\Desktop\\Alexandria_node\\public\\FailAuth.html');
            };
            function userPage(){
                // создание ссесии для юзера и хранение его инфы
                req.session.user = {
                    firstname: result[0].firstname,
                    surname: result[0].surname,
                    userLogin: userLogin,
                    userPassword: userPassword
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



// изменение информации товара в бд от админа (бесконечный цицл идет, но обновление происходит)
app.post("/edit_info_in_BD", encodeUrl, (req,res) =>{
    var find_product = req.body.find_product;
    var edit_price = req.body.edit_price;
    var edit_year  = req.body.edit_years_realise;

    connection.connect(function(err){
        if(err){
            console.log(err)
        }

//проверка на наличие товара в бд
        connection.query(`SELECT * FROM products_site WHERE product_name = '${find_product}'`, function(err, result){
        if(err){
            console.log(err)
        }else{
            connection.query(`UPDATE products_site SET product_name = '${find_product}', price = '${edit_price}', year_release = '${edit_year}'`);
        }

        });
    });
});

//удаление информации из БД(работает но как и в случае с изменением бесконечно грузится страница, но удаление происходит успешно)
app.post("/delete_info_in_BD", encodeUrl, (req,res) =>{
    var finder_to_delete = req.body.find_product_to_delete;

    connection.connect(function(err){
        if(err){
            console.log(err)
        }

connection.query(`DELETE FROM products_site WHERE product_name = '${finder_to_delete}'`, function(err, result){
        if(err){
            console.log(err)
        }
        });
    });
});

//добавление товара в бд(Выбивает сервер, не знаю почему, запрос корректен)
app.post("/add_info_in_BD", encodeUrl, (req,res) =>{
    var name_product_to_upload = req.body.name_product_to_add;
    var price_product_to_upload = req.body.price_product_to_add;
    var year_release_to_upload = req.body.year_release_to_add;

        connection.connect(`INSERT INTO products_site ('product_name', 'price', 'year_release') VALUES ('${name_product_to_upload}', '${price_product_to_upload}', '${year_release_to_upload}'`, function(err){
            if(err){
                console.log(err)
            }
        });
    });