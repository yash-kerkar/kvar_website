const res = require('express/lib/response');
const {MongoClient, ObjectId} = require('mongodb');
//const uri = "mongodb+srv://yash:1234@medistore.pleat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const uri = "mongodb://localhost";
const client = new MongoClient(uri);

module.exports = {
    addProduct:async function addProduct(product){
     
    
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
            return product._id;
        }
    },

    addModel:async function addModel(id,model){
        try {
            // Connect to the MongoDB cluster
            await client.connect();
            model._id = new ObjectId();
            // Make the appropriate DB calls
            result = await client.db("kvar").collection("products").findOneAndUpdate({_id:ObjectId(id)},{
                $push:{"models":model}
            });
            console.log("Model Inserted: "+model.name)
     
        } catch (e) {
            console.error(e);
            x = false
        } finally {
            await client.close();
            return model._id
        }
    },

    addCategory:async function addCategory(category){
     
    
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

    fetchAllModels:async function fetchAllModels(id){
        
        var result = null
     
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            result = await client.db("kvar").collection("products").findOne(ObjectId(id));
     
        } catch (e) {
            console.error(e);
            result = null;
        } finally {
            await client.close();
            return result.models;
        }
    },

    fetchAllCategories:async function fetchAllCategories(){
     
    
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
        var result = null
    
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

    fetchModel:async function fetchModel(product_id,id){
        var result = null
    
        try{
            await client.connect();
            result = await client.db("kvar").collection("products").findOne(ObjectId(product_id));
            let i = 0;
            console.log(ObjectId(id))
            while(result.models[i]){
                if(result.models[i]._id.equals(id)){
                    result = result.models[i];
                    break;
                } 
                console.log("yes");
                i++;
            }
    
        }catch(e){
            console.log(e);
            result = null;
        }finally{
            await client.close();
            return result
        }
    },

    fetchCategory:async function fetchCategory(id){
        var result = null
    
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
        var result = null
    
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
        var val = true;
    
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

    updateModel:async function updateModel(id,model){
        var val = true;
    
        try{
            await client.connect();
            result = await client.db("kvar").collection("products").findOne({_id:ObjectId(id)});
            let models = result.models;
            models[0].name = model.name;
            models[0].description = model.description;
            if(model.uploadImages[0]) models[0].images = model.uploadImages;
                    
            result = await client.db("kvar").collection("products").findOneAndUpdate({_id:ObjectId(id)},{
                $set:{"models":models
               }})
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
        var val = true;
    
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

    deleteModel:async function deleteModel(product_id,model_id){
     
    
        var x = true
     
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            product = await client.db("kvar").collection("products").findOne(ObjectId(product_id));

            result = await client.db("kvar").collection("products").updateOne({
                "_id": ObjectId(product_id)
              },
              {
                "$pull": {
                  "models": {
                    "_id": ObjectId(model_id)
                  }
                }
            })
     
        } catch (e) {
            console.error(e);
            x = false
        } finally {
            await client.close();
            return [x,product]
        }
    },

    deleteCategory:async function deleteCategory(id){
     
    
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
     
    
        var x = true
     
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            let admin = await client.db("kvar").collection("admin").find().toArray();
            updated = await client.db("kvar").collection("admin").findOneAndUpdate({_id:admin[0]._id},{
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
     
    
     
        try {
            // Connect to the MongoDB cluster
            await client.connect();
     
            // Make the appropriate DB calls
            admin = await client.db("kvar").collection("admin").find().toArray();
     
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
            return admin[0];
        }
    },

}