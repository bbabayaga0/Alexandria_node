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
const { resolveSoa } = require("dns");
const { error } = require("console");
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
    res.sendFile('C:\\Users\\baba_yaga0\\Desktop\\Alexandria_node\\public\\ready_sets.ejs')

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

app.get("/AdmReg", (req, res) =>{
    res.sendFile('C:\\Users\\baba_yaga0\\Desktop\\Alexandria_node\\public\\admin_register.html')
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
    cookie: {maxAge: 0}, //12 часов - 1000 * 60 * 60 * 12
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
}); //89 cтрока

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
            };
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

//добавление товара в бд(иногда выдает ошибку но при этом данные уходят)
app.post("/add_info_in_BD", encodeUrl, (req,res) =>{
    var name_product_to_upload = req.body.name_product_to_add;
    var price_product_to_upload = req.body.price_product_to_add;
    var year_release_to_upload = req.body.year_release_to_add;

    connection.connect(function(err){
        if(err){
            console.log(err)
        }
        
        var sql_add_product = `INSERT INTO products_site (product_name, price, year_release) VALUES ('${name_product_to_upload}', '${price_product_to_upload}', '${year_release_to_upload}')`;
            connection.query(sql_add_product, function(err, result){
                if(err){
                    console.log(err)
                }else{
                    console.log("успешное добавление")
                }
        });
    });
});

//авторизация админа
app.post("/admin_accses", encodeUrl, (req, res) =>{
    var admin_access_login = req.body.login_to_admin_accsess;
    var admin_access_password = req.body.password_to_admin_accsess;
     // проверка 
    connection.connect(function(err) {
        if(err){
            console.log(err)
        };

        connection.query(`SELECT * FROM admin_accses WHERE login = '${admin_access_login}' AND password = '${admin_access_password}'`, function (err, result){
            if(err){
                res.sendFile('C:\\Users\\baba_yaga0\\Desktop\\Alexandria_node\\public\\FailAuth.html');
            };
            function adminPage(){
                // создание ссесии для админа и хранение его инфы
                req.session.admin = {
                    admin_access_login: admin_access_login,
                    admin_access_password: admin_access_password
                };
                    res.redirect('/admin_panel')
            }
            if(Object.keys(result).length > 0){
                adminPage();
            }else{
                res.sendFile('C:\\Users\\baba_yaga0\\Desktop\\Alexandria_node\\public\\FailAuth.html');
            };
        });
    })
});

//обновление пароля пользователя
app.post("/update_password", encodeUrl, (req, res) =>{
    var upd_pass_log_finder = req.body.upd_pass_log_finder;
    var upd_pass_new_pass = req.body.upd_pass_new_pass;
    var upd_pass_confrim = req.body.upd_pass_confrim;

    connection.connect(function(err){
        if(err){
            console.log(err)
        };

//Проверка на наличие пользователя
        connection.query(`SELECT * FROM Users WHERE login = '${upd_pass_log_finder}'`, function(err, result){
            if(err & upd_pass_new_pass !== upd_pass_confrim){
                console.log("Ошибка при поиске или ошибка в паролях")
            }else{
                connection.query(`UPDATE Users SET password = '${upd_pass_new_pass}'`)
            }
        });
    });
});

// отзывы о сайте от пользователей
app.post("/user_reviews_about_site", encodeUrl, (req,res) =>{
    var name_reviewer = req.body.names_reviewers;
    var review_from_user = req.body.review;

    connection.connect(function(err){
        if(err){
            console.log(err)
        }

        var sql_review_users = `INSERT INTO reviews_from_users (name_users, reviews) VALUES ('${name_reviewer}', '${review_from_user}')`;
            connection.query(sql_review_users, function (err, result) {
                if(err){
                    console.log(err)
                }else{
                    console.log("успешное добавление отзыва")
            };
        });
    });
});

// вывод информации в div для страницы "О компании"(не работает)
app.get("/info_about_us", encodeUrl, (req, res) => {
    connection.query(`SELECT * FROM about_us `, function(err, result){
        if(err){
            console.log("Ошибка при выводе")
        };
        var data = {"info": result.info};
        document.getElementById('p_text_for_info').innerHTML = data;
    });
});

//изменение информации со страницы "О компании"
app.post("/eiac", encodeUrl, (req, res) =>{
    var ntfp = req.body.new_text_for_page;

    connection.connect(function(err){
        if(err){
            console.log(err)
        };

        connection.query(`UPDATE about_us SET text_info = '${ntfp}'`, function(err,result){
            if(err){
                console.log("что-то пошло не так на 322 строке")
            }
        });
    });
});

// Получение данных из и последующая их обработка для отображения начиная с 332стр и ....

app.get("/lifbd", encodeUrl, (req, res) =>{
    const query = `SELECT * FROM products_site`;

    //Выполнение запроса
    connection.query(query, (error, result) =>{
        if(!req.session.cart){
            req.session.cart = [];
        }
        res.render('product', { products : result, cart : request.session.cart })
    });
});

    app.post("/add_cart", encodeUrl, (req, res) =>{
        const product_id = req.body.product_id;
        const product_name = req.body.product_name;
        const product_price = req.body.product_price;

        let count = 0;

        for(let i = 0; i < req.session.cart.length; i++){
            if(req.session.cart[i].product_id === product_id){
                req.session.cart[i].quantity += 1;
                count++;
            }
        }
// quantity - количество
// что не забыть про parseFloat —  функция принимает строку в качестве аргумента и возвращает десятичное число (число с плавающей точкой).
        if(count === 0){
            const cart_data = {
                product_id : product_id,
                product_name : product_name,
                product_name : parseFloat(product_price),
                quantity : 1
            };
            req.session.cart.push(cart_data);
        }
        response.redirect("/lifbd")
    });