const res = require('express/lib/response');
const {MongoClient, ObjectId} = require('mongodb');
module.exports = {
    addProduct:async function addProduct(product){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
     
        const client = new MongoClient(uri);
        var x = true
     
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            result = await client.db("kvar").collection("products").insertOne(product);
            console.log("Product Inserted: "+product.name)
     
        } catch (e) {
            console.error(e);
            x = false
        } finally {
            await client.close();
            return product._id
        }
    },

    addCategory:async function addCategory(category){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
     
        const client = new MongoClient(uri);
        var x = true
     
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            result = await client.db("kvar").collection("category").insertOne(category);
            console.log("Category Inserted: "+category.name)
     
        } catch (e) {
            console.error(e);
            x = false
        } finally {
            await client.close();
            return category._id
        }
    },
    
    fetchAllProducts:async function fetchAllProducts(cat_count){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
     
        const client = new MongoClient(uri);
        var result = null
        var count_cat_wise = {}
     
        try {
            // Connect to the MongoDB cluster
            await client.connect();

            result = await client.db("kvar").collection("products").find().toArray();

            if(cat_count){
                count_cat_wise.total = result.length
                result.forEach(function (product){
                    if(product.category in count_cat_wise)
                        count_cat_wise[product.category] = count_cat_wise[product.category] + 1
                    else
                    count_cat_wise[product.category] = 1
                })
                result = count_cat_wise
            }
            // Make the appropriate DB calls

     
        } catch (e) {
            console.error(e);
            result = null;
        } finally {
            await client.close();
            return result
        }
    },

    fetchAllCategories:async function fetchAllCategories(){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
     
        const client = new MongoClient(uri);
        var result = null
     
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            result = await client.db("kvar").collection("category").find().toArray()
     
        } catch (e) {
            console.error(e);
            result = null;
        } finally {
            await client.close();
            return result
        }
    },
    
    fetchProduct:async function fetchProduct(id){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
        var result = null
        const client = new MongoClient(uri);
        try{
            await client.connect();
            result = await client.db("kvar").collection("products").findOne(ObjectId(id));
    
        }catch(e){
            console.log(e);
            result = null;
        }finally{
            await client.close();
            return result
        }
    },

    fetchCategory:async function fetchCategory(id){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
        var result = null
        const client = new MongoClient(uri);
        try{
            await client.connect();
            result = await client.db("kvar").collection("category").findOne(ObjectId(id));
    
        }catch(e){
            console.log(e);
            result = null;
        }finally{
            await client.close();
            return result
        }
    },

    fetchCategoryByName:async function fetchCategoryByName(name){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
        var result = null
        const client = new MongoClient(uri);
        try{
            await client.connect();
            result = await client.db("kvar").collection("category").findOne({name:name});
    
        }catch(e){
            console.log(e);
            result = null;
        }finally{
            await client.close();
            return result
        }
    },

    fetchCategoryProducts:async function fetchCategoryProducts(category){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
        const client = new MongoClient(uri);
        var result = null;
        try{
            await client.connect();
            result = await client.db("kvar").collection("products").find({category:category}).toArray()
        }catch(e){
            console.log(e);
        }finally{
            await client.close();
            return result
        }
    },

    fetchCategoryProductsByID:async function fetchCategoryProductsByID(id){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
        const client = new MongoClient(uri);
        var result = null;
        try{
            await client.connect();
            let cat = await client.db("kvar").collection("category").findOne(ObjectId(id));
            result = await client.db("kvar").collection("products").find({category:cat.name}).toArray();
        }catch(e){
            console.log(e);
        }finally{
            await client.close();
            return result
        }
    },
    
    updateProduct:async function updateProduct(id,product){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
        var val = true;
        const client = new MongoClient(uri);
        console.log(product.deleteImages)
        try{
            await client.connect();
            result = await client.db("kvar").collection("products").findOneAndUpdate({_id:ObjectId(id)},{
                $set:{"name":product.name,
                    "description":product.description,
                    "category":product.category,
                    "subCategory":product.subCategory,
                    "price":product.price,
                    "details":product.details
               },$push:{"images":{$each:product.uploadImages}}
            });
            result = await client.db("kvar").collection("products").findOneAndUpdate({_id:ObjectId(id)},{
               $pull:{"images":{"filename":{$in:product.deleteImages}}}
            });
    
        }catch(e){
            console.log(e);
            val = false;
        }finally{
            await client.close();
            return val
        }
    },

    updateCategory:async function updateCategory(id,category){
        console.log(id)
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
        var val = true;
        const client = new MongoClient(uri);
        console.log(category.deleteImages)
        try{
            await client.connect();
            let x = await client.db("kvar").collection("category").findOne(ObjectId(id));
            result = await client.db("kvar").collection("category").findOneAndUpdate({_id:ObjectId(id)},{
                $set:{"name":category.name,
                    "description":category.description
               },$push:{"images":{$each:category.uploadImages}}
            });
            result = await client.db("kvar").collection("category").findOneAndUpdate({_id:ObjectId(id)},{
               $pull:{"images":{"filename":{$in:category.deleteImages}}}
            });
            if(x.name !== category.name){
                result = await client.db("kvar").collection("products").updateMany({category:x.name},{$set:{category:category.name}});
            }
    
        }catch(e){
            console.log(e);
            val = false;
        }finally{
            await client.close();
            return val
        }
    },
    
    deleteProduct:async function deleteProduct(id){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
     
        const client = new MongoClient(uri);
        var x = true
     
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            product = await client.db("kvar").collection("products").findOne(ObjectId(id));
            result = await client.db("kvar").collection("products").findOneAndDelete({_id:ObjectId(id)})
     
        } catch (e) {
            console.error(e);
            x = false
        } finally {
            await client.close();
            return [x,product]
        }
    },

    deleteCategory:async function deleteCategory(id){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
     
        const client = new MongoClient(uri);
        var x = true
     
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            category = await client.db("kvar").collection("category").findOne(ObjectId(id));
            result = await client.db("kvar").collection("category").findOneAndDelete({_id:ObjectId(id)})
     
        } catch (e) {
            console.error(e);
            x = false
        } finally {
            await client.close();
            return [x,category]
        }
    },

    searchProducts:async function searchProducts(name){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
     
        const client = new MongoClient(uri);
        var x = true;
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            products = await client.db("kvar").collection("products").find({$or:[{"name":{$regex : name,$options:"i"}},{"category":{$regex : name,$options:"i"}}]}).toArray();
            x = products
     
        } catch (e) {
            console.error(e);
            x = false
        } finally {
            await client.close();
            return x
        }
    },

    addBSeller:async function addBSeller(id){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
     
        const client = new MongoClient(uri);
        var x = true;
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            add = await client.db("kvar").collection("BSeller").find().toArray();
            if(add.length < 4){
                product = await client.db("kvar").collection("products").findOne({_id:ObjectId(id)});
                add = await client.db("kvar").collection("BSeller").insertOne(product);
            }
            else x = false
     
        } catch (e) {
            console.error(e);
            x = false
        } finally {
            await client.close();
            return x
        }

    },


    removeBSeller:async function removeBSeller(id){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
     
        const client = new MongoClient(uri);
        var x = true;
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            product = await client.db("kvar").collection("BSeller").findOneAndDelete({_id:ObjectId(id)});
            
        } catch (e) {
            console.error(e);
            x = false
        } finally {
            await client.close();
            return x
        }

    },

    fetchBSellers:async function fetchBSellers(){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
     
        const client = new MongoClient(uri);
        var x = true;
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            product = await client.db("kvar").collection("BSeller").find().toArray();
            x = product;
            
        } catch (e) {
            console.error(e);
            x = false
        } finally {
            await client.close();
            return x
        }

    },
    
    updatePassword:async function updatePassword(pass){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
     
        const client = new MongoClient(uri);
        var x = true
     
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            updated = await client.db("kvar").collection("admin").findOneAndUpdate({_id:ObjectId("61cd5f9464f84fdc2f5dc863")},{
                 $set:{"password":pass}
            });
     
        } catch (e) {
            console.error(e);
            x = false
        } finally {
            await client.close();
            return x
        }
    },
    
    getAdmin:async function getAdmin(){
        const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
     
        const client = new MongoClient(uri);
     
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            admin = await client.db("kvar").collection("admin").findOne(ObjectId("61cd5f9464f84fdc2f5dc863"));
     
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
            return admin
        }
    },

}