const express = require('express');
const res = require('express/lib/response');
const { model } = require('mongoose');
    multer = require('multer');
    router = express.Router()
    path = require('path');
    fs = require("fs")
    storage =   multer.diskStorage({  
        destination: function (req, file, callback) {  
        callback(null, './public/img');  
     },  
        filename: function (req, file, callback) { 
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));  
     }  
    });
    storage1 = multer.diskStorage({  
        destination: function (req, file, callback) {  
        callback(null, './public/brochures');  
     },  
        filename: function (req, file, callback) { 
        callback(null, file.originalname);  
     }  
    });
    storage2 = multer.diskStorage({  
        destination: function (req, file, callback) {  
        callback(null, './public/gallery/imgs');  
     },  
        filename: function (req, file, callback) { 
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));  
     }  
    });
    storage3 = multer.diskStorage({  
        destination: function (req, file, callback) {  
        callback(null, './public/gallery/vids');  
     },  
        filename: function (req, file, callback) { 
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));  
     }  
    });
    storage4 = multer.diskStorage({  
        destination: function (req, file, callback) {  
        callback(null, './public/gallery/presentation');  
     },  
        filename: function (req, file, callback) { 
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));  
     }  
    });
    upload = multer({ storage: storage }) 
    upload1 = multer({ storage: storage1 }) 
    upload2 = multer({ storage: storage2 }) 
    upload3 = multer({ storage: storage3 }) 
    upload4 = multer({ storage: storage4 }) 
    bcrypt = require('bcrypt');
    query = require('../DBqueries');
    constant = require('../constant');
const directoryPath = path.join(__dirname, '../public/brochures');
const galleryPathImages = path.join(__dirname,'../public/gallery/imgs')
const galleryPathVideos = path.join(__dirname,'../public/gallery/vids')

const requireLogin = (req,res,next) => {
    if(!req.session.user_id) return res.redirect("/admin/login");
    next()
}

navigation_content();

/*router.get('/example',function(req,res){
    res.render('admin/example')
})*/
router.get('/',requireLogin,async function(req,res){
    let productsCatWise = await query.fetchAllProducts(true)
    res.render('admin/index',{
        user:"yash",
        productsCatWise:productsCatWise
    });
});

router.get('/addProduct',requireLogin,async function(req,res){
    let categories = await query.fetchAllCategories()
    console.log("category"+categories)
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
        res.render('admin/addProduct',{
            insertRequest:false,
            brochures:brochures,
            categories:categories
        })
    })
})

router.get('/products/:id/addmodel',requireLogin,function(req,res){
    res.render('admin/addModel',{id:req.params.id,insertRequest:false});
})

router.post('/products/:id/addModel',requireLogin,upload.array('images'),async function(req,res){
    let model = req.body.model;
    model.images = req.files.map(f=>({url:f.path,filename:f.filename}));
    let id = await query.addModel(req.params.id,model);
    res.redirect('/admin/products/'+req.params.id);
})

router.get('/addCategory',requireLogin,async function(req,res){
    res.render('admin/addCategory')
})


router.post('/addProduct',requireLogin,upload.array('images'),async function(req,res){
    let product = req.body.product
    console.log(req.body)
    product.details = convert_to_object(product.details)
    product.images = req.files.map(f=>({url:f.path,filename:f.filename}))
    let id = await query.addProduct(product)
    await navigation_content()
    res.redirect('products/'+id)
})

router.post('/addCategory',requireLogin,upload.array('images'),async function(req,res){
    var category = req.body.category
    category.images = req.files.map(f=>({url:f.path,filename:f.filename}))
    var id = await query.addCategory(category)
    await navigation_content()
    res.redirect('categories/'+id)
})

router.get('/addBSeller',requireLogin,async function(req,res){
    let page = 1;
    if(req.query.page){
        page = req.query.page
    }
    var val = await query.fetchAllProducts(false)
    var page_count = Math.ceil(val.length / 10)

    let products = val.sort((a,b)=>{return a.name.localeCompare(b.name) }).slice(page*10 - 10,page*10)
    res.render('admin/addBSeller',{
        products:products,
        page_count:page_count,
        cur_page:page
    });
})

router.post("/addBSeller",requireLogin,async function(req,res){
    var val = await query.searchProducts(req.body.name);
    res.render('admin/addBSeller',{
        products:val
    })
})

router.post('/addBSeller/:id',requireLogin,async function(req,res){
    var val = await query.addBSeller(req.params.id);
    res.redirect("../BSellers");
})

router.get('/BSellers',requireLogin,async function(req,res){
    var val = await query.fetchBSellers();
    res.render('admin/viewBSellers',{
        products:val
    });
})

router.post('/removeBSeller/:id',requireLogin,async function(req,res){
    var val = await query.removeBSeller(req.params.id);
    res.redirect('../BSellers');
})

router.get('/products',requireLogin,async function(req,res){
    let page = 1;
    if(req.query.page){
        page = req.query.page
    }
    var val = await query.fetchAllProducts(false)
    var page_count = Math.ceil(val.length / 10)

    let products = val.sort((a,b)=>{return a.name.localeCompare(b.name) }).slice(page*10 - 10,page*10)
    res.render('admin/viewProducts',{
        products:products,
        page_count:page_count,
        cur_page:page
    })
})

router.post("/products",requireLogin,async function(req,res){
    var val = await query.searchProducts(req.body.name);
    res.render('admin/viewProducts',{
        products:val
    })
})


router.get('/categories',requireLogin,async function(req,res){
    var val = await query.fetchAllCategories()
    res.render('admin/viewCategories',{
        categories:val
    })
})

router.get("/products/:id",requireLogin,async function(req,res){
    var product = await query.fetchProduct(req.params.id)
    console.log(product)
    res.render("admin/viewProduct",{
        product:product
    })
})

router.get('/products/:id/models',requireLogin,async function(req,res){
    var models = await query.fetchAllModels(req.params.id);
    res.render('admin/viewModels',{models:models,product_id:req.params.id});
})


router.get("/categories/:id",requireLogin,async function(req,res){
    var category = await query.fetchCategory(req.params.id)
    res.render("admin/viewCategory",{
        category:category
    })
})

router.get('/products/:id/edit',requireLogin,async function(req,res){
    var val = await query.fetchProduct(req.params.id)
    var categories = await query.fetchAllCategories()
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        var brochures = []
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            brochures.push(file)
        });
        console.log(brochures)
        res.render("admin/editProduct",{
            updateRequest:false,
            product:val,
            brochures:brochures,
            categories:categories
        })
    })
})

router.get('/categories/:id/edit',requireLogin,async function(req,res){
    var val = await query.fetchCategory(req.params.id)
    res.render("admin/editCategory",{
        updateRequest:false,
        category:val,
    })
})

router.get("/products/:product_id/models/:id/edit",requireLogin,async function(req,res){
    var model = await query.fetchModel(req.params.product_id,req.params.id);
    res.render("admin/editModel",{
        updateRequest:false,
        product_id:req.params.product_id,
        model:model
    })
})

router.put('/products/:product_id/models/:model_id/edit',requireLogin,upload.array('images'),async function(req,res){
    var uploadImages = []
    var deleteImages = []
    var model = req.body.model
    if(req.files) uploadImages = req.files.map(f=>({url:f.path,filename:f.filename}))
    if(req.body.deleteImages) deleteImages = req.body.deleteImages
    model.uploadImages = uploadImages
    model.deleteImages = deleteImages
    var val = await query.updateModel(req.params.product_id,req.params.model_id,model)
    res.redirect("../../../../products/"+req.params.product_id)
    if(val){
        deleteImages.forEach(image => {
            fs.unlink("public/img/"+image, (err) => {
                if (err) {
                  console.error(err)
                  return
            } 
          })
        });
    }
})

router.put('/products/:id/edit',requireLogin,upload.array('images'),async function(req,res){
    var uploadImages = []
    var deleteImages = []
    var product = req.body.product
    product.details = convert_to_object(product.details)
    if(req.files) uploadImages = req.files.map(f=>({url:f.path,filename:f.filename}))
    if(req.body.deleteImages) deleteImages = req.body.deleteImages
    product.uploadImages = uploadImages
    product.deleteImages = deleteImages
    var val = await query.updateProduct(req.params.id,product)
    await navigation_content();
    res.redirect("../../products/"+req.params.id)
    if(val){
        deleteImages.forEach(image => {
            fs.unlink("public/img/"+image, (err) => {
                if (err) {
                  console.error(err)
                  return
            } 
          })
        });
    }
})

router.put('/categories/:id/edit',requireLogin,upload.array('images'),async function(req,res){
    var uploadImages = []
    var deleteImages = []
    var category = req.body.category
    if(req.files) uploadImages = req.files.map(f=>({url:f.path,filename:f.filename}))
    if(req.body.deleteImages) deleteImages = req.body.deleteImages
    category.uploadImages = uploadImages
    category.deleteImages = deleteImages
    var val = await query.updateCategory(req.params.id,category)
    await navigation_content();
    res.redirect("../../categories/"+req.params.id)
    if(val){
        deleteImages.forEach(image => {
            fs.unlink("public/img/"+image, (err) => {
                if (err) {
                  console.error(err)
                  return
            } 
          })
        });
    }
})

router.delete('/products/:id/delete',requireLogin,async function(req,res){
    var val = await query.deleteProduct(req.params.id)
    await navigation_content();
    res.redirect("../../products");
    if(val[0] == true){
        val[1].images.forEach(image => {
            console.log("public/img/"+image.filename)
            fs.unlink("public/img/"+image.filename, (err) => {
                if (err) {
                    console.error(err)
                    return
            } 
            })
        });
    }
})

router.delete('/products/:product_id/models/:model_id/delete',requireLogin,async function(req,res){
    var val = await query.deleteModel(req.params.product_id,req.params.model_id)
    res.redirect("../../../../products/"+req.params.product_id);
    if(val[0] == true){
        val[1].images.forEach(image => {
            console.log("public/img/"+image.filename)
            fs.unlink("public/img/"+image.filename, (err) => {
                if (err) {
                    console.error(err)
                    return
            } 
            })
        });
    }
})

router.delete('/categories/:id/delete',requireLogin,async function(req,res){
    var val = await query.deleteCategory(req.params.id)
    await navigation_content();
    res.redirect("../../categories");
    if(val[0] == true){
        val[1].images.forEach(image => {
            console.log("public/img/"+image.filename)
            fs.unlink("public/img/"+image.filename, (err) => {
                if (err) {
                    console.error(err)
                    return
            } 
            })
        });
    }
})

router.get('/brochures',requireLogin,function(req,res){
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
        res.render('admin/brochures',{
            brochures:brochures
        })
    })
})

router.get('/galleryImages',requireLogin,function(req,res){
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
        res.render('admin/galleryImages',{
            images:images
        })
    })
})

router.get('/galleryVideos',requireLogin,function(req,res){
    fs.readdir(galleryPathVideos, function (err, files) {
        //handling error
        let videos = []
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            videos.push(file)
        });
        res.render('admin/galleryVideos',{
            videos:videos
        })
    })
})

router.get('/addBrochure',requireLogin,function(req,res){
    res.render('admin/addBrochure',{
        type:"Brochures",
        link:"/admin/addBrochure"
    })
})

router.get('/addGalleryImages',requireLogin,function(req,res){
    res.render('admin/addBrochure',{
        type:"Images for Gallery",
        link:"/admin/addGalleryImages"
    })
})

router.get('/addGalleryVideos',requireLogin,function(req,res){
    res.render('admin/addBrochure',{
        type:"Videos for Gallery",
        link:"/admin/addGalleryVideos"
    })
})

router.post('/addBrochure',requireLogin,upload1.array('brochures'),function(req,res){
    res.redirect('/admin/brochures');
})

router.post('/addGalleryImages',requireLogin,upload2.array('brochures'),function(req,res){
    res.redirect('/admin/galleryImages');
})

router.post('/addGalleryVideos',requireLogin,upload3.array('brochures'),function(req,res){
    res.redirect('/admin/galleryVideos');
})

router.delete('/brochures/:name/delete',requireLogin,function(req,res){
    fs.unlink("public/brochures/"+req.params.name, (err) => {
        if (err) {
            console.error(err)
        }
        res.redirect('/admin/brochures');
    });
})

router.delete('/galleryImages/:name/delete',requireLogin,function(req,res){
    fs.unlink("public/gallery/imgs/"+req.params.name, (err) => {
        if (err) {
            console.error(err)
        }
        res.redirect('/admin/galleryImages');
    });
})

router.delete('/galleryVideos/:name/delete',requireLogin,function(req,res){
    fs.unlink("public/gallery/vids/"+req.params.name, (err) => {
        if (err) {
            console.error(err)
        }
        res.redirect('/admin/galleryVideos');
    });
})

router.get('/login',function(req,res){
    let invalid = false;
    if(req.query.invalid) invalid = true;
    res.render('admin/login',{invalid:invalid})
})

router.post('/login',async function(req,res){
    const pass = req.body.password
    const admin = await query.getAdmin()
    const actualPass = admin.password
    const id = admin._id
    var valid = await bcrypt.compare(pass,actualPass)
    if(valid){
        req.session.user_id = id
        res.redirect('/admin')
    }
    else res.redirect('/admin/login?invalid=true')
})

router.get('/changePassword',requireLogin,function(req,res){
    res.render('admin/changePassword')
})

router.post('/changePassword',requireLogin,async function(req,res){
    const pass = req.body.password
    const hash = await bcrypt.hash(pass,12)
    updated = await query.updatePassword(hash)
    if(updated) res.redirect("/admin")
    else res.send("Error in updating")
});

router.post('/logout',requireLogin,function(req,res){
    req.session.destroy()
    res.redirect('/admin/login')
})

function convert_to_object(str){
    var x = str.trim().split(/\n/)  //First trim spaces from start and end then split each line 
    var j = []
    x.forEach(element => {
       // j.push(element.split(/\s{1,}|\t/))     // Split on (one and more spaces) OR (tab) ie split into key-values
       j.push(element.split("="))
    });
    details = {}
    for(var i = 0;i<j.length;i++){
        details[j[i][0]] = j[i][1]     // Store key-value pair in product details
    }
    return details
}


async function navigation_content(){
    constant.categories = await query.fetchAllCategories();
    let products_fromdb = await query.fetchAllProducts();
    let products_temp = [];
    products_fromdb.forEach(product =>{
        let temp = {
            name:product.name,
            _id:product._id,
            category:product.category
        }
        products_temp.push(temp);
    })
    constant.products = products_temp;
}


module.exports = router;
