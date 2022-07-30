var express = require('express');
    bodyParser = require('body-parser')
    methodOverride = require('method-override');
    expressSession = require('express-session')
    adminRoutes = require('./routes/admin'); 
    app = express();
    query = require('./DBqueries');
    constant = require('./constant');
    nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'kerkaryash4@gmail.com',
          pass: 'unwxtdzacshzucok'
        }
    });
    axios = require("axios");
    directoryPath = path.join(__dirname, './public/brochures');
    galleryPathImages = path.join(__dirname,'./public/gallery/imgs')
    galleryPathVideos = path.join(__dirname,'./public/gallery/vids')

app.set('views','./views');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(methodOverride('_method'));
app.use(expressSession({secret:'secret', resave: false,saveUninitialized: true,}))
app.use('/admin',adminRoutes)

//xyz
//admin_pass = "12345"
// mongosh "mongodb+srv://medistore.pleat.mongodb.net/myFirstDatabase"--username yash  -- command for connecting mongosh to cluster

/*app.get('/category/:category_name',async function(req,res){
    var str = req.params.category_name.replace("-"," ")
    var category = await query.fetchCategoryByName(str)
    var products = await query.fetchCategoryProducts(str)
    console.log(products)
    res.render('category',{
        products:products,
        category:category
    })
})*/
const PORT = process.env.PORT || 3000;
const RECAPTCHA_SECRET = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";

app.get('/',async function(req,res){
    var bseller = await query.fetchBSellers();
    console.log(constant.categories,constant.products)
    var categories = await query.fetchAllCategories();
    res.render('index',{
        nav_products:constant.products,
        nav_categories:constant.categories,
        categories:categories,
        bseller:bseller,
        length:constant.categories.length});
})

app.get("/category/:id",async function(req,res){
    var category = await query.fetchCategory(req.params.id);
    var products = await query.fetchCategoryProducts(category.name);
    res.render("category",{
        nav_products:constant.products,
        nav_categories:constant.categories,
        category:category,
        products:products
    })
})


app.get('/products/:id',async function(req,res){
    var product = await query.fetchProduct(req.params.id)
    res.render('product',{
        nav_products:constant.products,
        nav_categories:constant.categories,
        product:product
    })
})

app.get('/contact',function(req,res){
    res.render('contact',{
        nav_products:constant.products,
        nav_categories:constant.categories
    });
})

app.get('/about',function(req,res){
    res.render('about',{
        nav_products:constant.products,
        nav_categories:constant.categories
    });
})

app.get('/presentation',function(req,res){
    res.render('presentation',{
        nav_products:constant.products,
        nav_categories:constant.categories
    });
})

app.get('/blogs',function(req,res){
    res.render('blogs',{
        nav_products:constant.products,
        nav_categories:constant.categories
    });
})

app.get('/galleryImages',function(req,res){
    fs.readdir(galleryPathImages, function (err, files) {
        //handling error
        let images = []
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            images.push(file)
        });
        res.render('galleryImages',{
            nav_products:constant.products,
            nav_categories:constant.categories,
            images:images
        })
    })
})

app.get('/brochures',function(req,res){
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        let brochures = []
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            brochures.push(file)
        });
        res.render('brochures',{
            nav_products:constant.products,
            nav_categories:constant.categories,
            brochures:brochures
        })
    })
})

/*app.post('/sendEmail',async function(request,response){
    var recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + RECAPTCHA_SECRET + "&";
    recaptcha_url += "response=" + request.body["g-recaptcha-response"] + "&";
    recaptcha_url += "remoteip=" + request.connection.remoteAddress;
    try {
		const res = await axios.post(recaptcha_url);
        console.log(res)
        if(res.data.success){
            var mailOptions = {
                from: 'kerkaryash4@gmail.com',
                to: 'yashkerkar1999@gmail.com',
                subject: request.body.subject,
                text: "Client Name: "+ request.body.name + "/n" + "Client Email: " + request.body.email + "/n" + "Message: " + request.body.message
            };
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
            });
            response.send("Email Sent")
        }
        else response.send("Recaptcha failed")
	} catch (err) {
		response.status(500).json({ message: err });
	}
})*/

app.get('*', function(req, res){
    res.send('Sorry, this is an invalid URL.');
}); 

app.listen(PORT,'127.0.0.1',()=>{
    console.log(`App is started`)
});

