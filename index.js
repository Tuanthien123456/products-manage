const express=require("express");
const app=express();

const path = require("path");
const cookieParser=require("cookie-parser");
const session=require("express-session");



// flash
const flash=require('express-flash');
app.use(cookieParser("ABC"));
app.use(session({cookie:{maxAge: 60000 }}));
app.use(flash());

//nhung phuong thuc
const methodOverride=require('method-override');
app.use(methodOverride("_method"));

const database=require("./config/database.js");
const systemConfig=require("./config/sytem.js");

// nhung env
require("dotenv").config();
const port=process.env.PORT;

//tinymce
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
//end tinymce

//nhung bodyparser
const bodyParser=require('body-parser');

app.use(bodyParser.urlencoded({ extended: false}));

const routes =require("./routes/client/index.routes");
const AdminRoutes =require("./routes/admin/index.router");

database.connect();

app.set("views",`${__dirname}/views`);
app.set("view engine","pug");
app.use(express.static(`${__dirname}/public`));

//routes
routes(app);
AdminRoutes(app);



// App Locals Variables (biến sử dụng được trong tất cả trong file pug)
app.locals.prefixAdmin=systemConfig.prefixAdmin;



app.listen(port,()=>{
    console.log(`Đang chạy bởi đường dẫn ${port}`);
});