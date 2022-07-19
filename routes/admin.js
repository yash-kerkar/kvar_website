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
    upload = multer({ storage: storage }) 
    bcrypt = require('bcrypt');
    query = require('../DBqueries');
const directoryPath = path.join(__dirname, '../public/brochures');

const requireLogin = (req,res,next) => {
    if(!req.session.user_id) return res.redirect("/admin/login");
    next()
}

/*router.get('/example',function(req,res){
    res.render('admin/example')
})*/
router.get('/',/*requireLogin,*/async function(req,res){
    let productsCatWise = await query.fetchAllProducts(true)
    console.log(productsCatWise)
    res.render('admin/index',{
        user:"yash",
        productsCatWise:productsCatWise
    });
});

router.get('/addProduct',/*requireLogin,*/async function(req,res){
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

router.get('/products/:id/addmodel',function(req,res){
    res.render('admin/addModel',{id:req.params.id,insertRequest:false});
})

router.post('/products/:id/addModel',upload.array('images'),async function(req,res){
    let model = req.body.model;
    model.images = req.files.map(f=>({url:f.path,filename:f.filename}));
    let id = await query.addModel(req.params.id,model);
    res.redirect('/admin/products/'+req.params.id);
})

router.get('/addCategory',/*requireLogin,*/async function(req,res){
    res.render('admin/addCategory')
})


router.post('/addProduct',/*requireLogin,*/upload.array('images'),async function(req,res){
    let product = req.body.product
    console.log(req.body)
    product.details = convert_to_object(product.details)
    product.images = req.files.map(f=>({url:f.path,filename:f.filename}))
    let id = await query.addProduct(product)
    res.redirect('products/'+id)
})

router.post('/addCategory',/*requireLogin,*/upload.array('images'),async function(req,res){
    var category = req.body.category
    category.images = req.files.map(f=>({url:f.path,filename:f.filename}))
    var id = await query.addCategory(category)
    res.redirect('categories/'+id)
})

router.get('/addBSeller',/*requireLogin,*/async function(req,res){
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

router.post("/addBSeller",/*requireLogin,*/async function(req,res){
    var val = await query.searchProducts(req.body.name);
    res.render('admin/addBSeller',{
        products:val
    })
})

router.post('/addBSeller/:id',/*requireLogin,*/async function(req,res){
    var val = await query.addBSeller(req.params.id);
    res.redirect("../BSellers");
})

router.get('/BSellers',/*requireLogin,*/async function(req,res){
    var val = await query.fetchBSellers();
    res.render('admin/viewBSellers',{
        products:val
    });
})

router.post('/removeBSeller/:id',/*requireLogin,*/async function(req,res){
    var val = await query.removeBSeller(req.params.id);
    res.redirect('../BSellers');
})

router.get('/products',/*requireLogin,*/async function(req,res){
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

router.post("/products",/*requireLogin,*/async function(req,res){
    var val = await query.searchProducts(req.body.name);
    res.render('admin/viewProducts',{
        products:val
    })
})


router.get('/categories',/*requireLogin,*/async function(req,res){
    var val = await query.fetchAllCategories()
    res.render('admin/viewCategories',{
        categories:val
    })
})

router.get("/products/:id",/*requireLogin,*/async function(req,res){
    var product = await query.fetchProduct(req.params.id)
    res.render("admin/viewProduct",{
        product:product
    })
})

router.get('/products/:id/models',async function(req,res){
    var models = await query.fetchAllModels(req.params.id);
    res.render('admin/viewModels',{models:models,product_id:req.params.id});
})


router.get("/categories/:id",/*requireLogin,*/async function(req,res){
    var category = await query.fetchCategory(req.params.id)
    res.render("admin/viewCategory",{
        category:category
    })
})

router.get('/products/:id/edit',/*requireLogin,*/async function(req,res){
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
        res.render("admin/editProduct",{
            updateRequest:false,
            product:val,
            brochures:brochures,
            categories:categories
        })
    })
})

router.get('/categories/:id/edit',/*requireLogin,*/async function(req,res){
    var val = await query.fetchCategory(req.params.id)
    res.render("admin/editCategory",{
        updateRequest:false,
        category:val,
    })
})

router.get("/products/:product_id/models/:id/edit",async function(req,res){
    var model = await query.fetchModel(req.params.product_id,req.params.id);
    res.render("admin/editModel",{
        updateRequest:false,
        product_id:req.params.product_id,
        model:model
    })
})

router.put('/products/:product_id/models/:model_id/edit',/*requireLogin,*/upload.array('images'),async function(req,res){
    var uploadImages = []
    var deleteImages = []
    var model = req.body.model
    if(req.files) uploadImages = req.files.map(f=>({url:f.path,filename:f.filename}))
    if(req.body.deleteImages) deleteImages = req.body.deleteImages
    model.uploadImages = uploadImages
    model.deleteImages = deleteImages
    var val = await query.updateModel(req.params.product_id,model)
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
    res.redirect("../../../../products/"+req.params.product_id)
})

router.put('/products/:id/edit',/*requireLogin,*/upload.array('images'),async function(req,res){
    var uploadImages = []
    var deleteImages = []
    var product = req.body.product
    product.details = convert_to_object(product.details)
    if(req.files) uploadImages = req.files.map(f=>({url:f.path,filename:f.filename}))
    if(req.body.deleteImages) deleteImages = req.body.deleteImages
    product.uploadImages = uploadImages
    product.deleteImages = deleteImages
    var val = await query.updateProduct(req.params.id,product)
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
    res.redirect("../../products/"+req.params.id)
})

router.put('/categories/:id/edit',/*requireLogin,*/upload.array('images'),async function(req,res){
    var uploadImages = []
    var deleteImages = []
    var category = req.body.category
    if(req.files) uploadImages = req.files.map(f=>({url:f.path,filename:f.filename}))
    if(req.body.deleteImages) deleteImages = req.body.deleteImages
    category.uploadImages = uploadImages
    category.deleteImages = deleteImages
    var val = await query.updateCategory(req.params.id,category)
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
    res.redirect("../../categories/"+req.params.id)
})

router.delete('/products/:id/delete',/*requireLogin,*/async function(req,res){
    var val = await query.deleteProduct(req.params.id)
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
    res.redirect("../../products");
})

router.delete('/products/:product_id/models/:model_id/delete',/*requireLogin,*/async function(req,res){
    var val = await query.deleteModel(req.params.product_id,req.params.model_id)
    res.redirect("../../../../products/"+req.params.product_id);
})

router.delete('/categories/:id/delete',/*requireLogin,*/async function(req,res){
    var val = await query.deleteCategory(req.params.id)
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
    res.redirect("../../categories");
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

router.get('/changePassword',/*requireLogin,*/function(req,res){
    res.render('admin/changePassword')
})

router.post('/changePassword',/*requireLogin,*/async function(req,res){
    const pass = req.body.password
    const hash = await bcrypt.hash(pass,12)
    updated = await query.updatePassword(hash)
    if(updated) res.redirect("/admin")
    else res.send("Error in updating")
});

router.post('/logout',/*requireLogin,*/function(req,res){
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

module.exports = router;