const mysql = require("mysql");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "Alexandria",
});

connection.connect({
    if(err){
        console.error("Ошибка соединения" + err.message);
        return;
    }
});

app.post("/register", (req, res) => {
    const {username, secondname, mail,password, login } = req.body;

    
});