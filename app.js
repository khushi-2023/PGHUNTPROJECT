const express = require('express');
const path = require("path");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();
const hbs = require('hbs');
const { Form} = require('./database/reg');
const { Formadm} = require('./database/admindb');
const { Formown} = require('./database/owndetails');
const { Formpro} = require('./database/addprop');
const { Formfeed} = require('./database/feedback');
const { Formpay} = require('./database/paymentdb');
const fs = require('fs');

//*************Monogdb conn******************/
// mongoo db conn
const mongoose = require('mongoose');
const { render } = require('ejs');
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost:27017/pghunting", { useNewUrlParser: true, useUnifiedTopology: true });

//****************************** */


//**************multer storage  for image upload**************//
let multer = require('multer')
let Storage = multer.diskStorage({
    destination:'public/photos/uploads/', 
    filename : (req , file, cb)=>{

        cb(null, file.originalname)
    }
})
let uplaod = multer({
    storage: Storage,
})
//********************************************* */


//*******port and view engine*******/
app.listen(process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs');
//app.set('view engine', 'hbs');

const staticpath = path.join(__dirname,'/.views');
app.use(express.static(staticpath))

//*******************************/
//************storage session************/
const session = require('express-session');


app.use(express.urlencoded({ extended: false}));
app.use(express.json());

app.use(
    session({
        secret : "my secret keyy",
        saveUninitialized: true,
        resave: false,
    })
);

app.use((req, res, next) =>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

//********************************************/

//app function
app.get('/',function(req, res) {
    res.render('intr');
})
app.get('/Customer',async (req, res)=>{
    Formfeed.find().exec((err , users)=>{
        if(err){
            res.json({message: err.message});
        }
        else {
            res.render("Customer", {
                users: users, 
            });
        }
    })
})
//************** owner and Add property Side******************************/
app.get('/ownreg', function (req, res) {
    res.render("ownreg", { issue: null });
})
app.post('/ownreg', (req, res) => {
    // console.log(req.body);
    if (req.body.password === req.body.passwordConfirmation) {
        bcrypt.hash(req.body.password, saltRounds).then(function (hash) {
            let newperson = new Formown({
               ownname: req.body.ownname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password,
                passwordConfirmation: req.body.passwordConfirmation
            })

            newperson.save();
        });
       
        // res.send("akdm ok ache");
        res.render("ownlogin",{issues : null})
       
    }
    else {
        res.render("ownreg", { issue: "passwords are not same" })
    }
})

app.get('/ownlogin', function (req, res) {
    res.render("ownlogin",{issues :null});

})
app.post("/ownlogin", async(req, res) =>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const emailus = await Formown.findOne({email: req.body.email});
        
        if(emailus.password === req.body.password){
            res.status(201).redirect('/property');   
        }
        else {
            res.render('ownlogin',{ issues: "Wrong Password or Email" })
        }    
    }catch (error) {
        res.render('ownlogin',{ issues: "Wrong Password or Email" })
     }
})

app.get('/property',async (req, res)=>{
    res.render("property", { issue: "",
    });
})
app.post('/property', uplaod.single('Imageup'),(req, res) => {
    // console.log(req.body);

    if (req.body.password === req.body.passwordConfirmation) {

            //    console.log(hash); //hashed password
            let newperson1 = new Formpro({
                protype: req.body.protype,
                builtyear: req.body.builtyear,
                country: req.body.country,
                Procity: req.body.Procity,
                locationurl: req.body.locationurl,
                proname: req.body.proname ,
                description: req.body.description,
                Imageup :req.file.filename,
                Sq: req.body.Sq ,
                price: req.body.price,
                Beds: req.body.Beds,
                dyning:req.body.dyning,
                Bath: req.body.Bath,
                Belcony: req.body.Belcony,
                Sharing: req.body.Sharing,
                aircondition: req.body.aircondition,
                otherfeature: req.body.otherfeature,
                fullname: req.body.fullname,
                email: req.body.email,
                phone: req.body.phone,
                instagram: req.body.instagram,
                twitter: req.body.twitter,
                whatsapp: req.body.whatsapp,
            })

            newperson1.save();
       
        // res.send("akdm ok ache");
         res.redirect("/property");
    }
    else {
        res.render("property", { issue: "Passwords are not same" })
    }
})

app.get('/feedback',async (req, res)=>{
    res.render("feedback"); 
})

app.post('/feedback', (req, res) => {
    // console.log(req.body);
            //    console.log(hash); //hashed password
            let newperson = new Formfeed({
               
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                countryCode: req.body.countryCode,
                phone: req.body.phone,
                Time: req.body.Time,
                Comments: req.body.Comments
            })

            newperson.save();
       
        // res.send("akdm ok ache");
        res.redirect("/feedback");
})
/************************************************************************************************************************************************/



//************** End users  Side  inedx , payment,******************************/
//register get and post
app.get('/register', function (req, res) {
    res.render("register", { issue: "" });
})
app.post('/register', (req, res) => {
    // console.log(req.body);

    if (req.body.password === req.body.passwordConfirmation) {
        bcrypt.hash(req.body.password, saltRounds).then(function (hash) {

            //    console.log(hash); //hashed password
            let newperson = new Form({
               
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                countryCode: req.body.countryCode,
                phone: req.body.phone,
                password: req.body.password,
                passwordConfirmation: req.body.passwordConfirmation
            })

            newperson.save();
       
        // res.send("akdm ok ache");
        res.render("login",{issues : null})
    });
    }
    else {
        res.render("register", { issue: "passwords are not same" })
    }
})
//login get and post
app.get('/login', function (req, res) {
    res.render("login",{issues :null});

})

app.post("/login", async(req, res) =>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const emailus = await Form.findOne({email: req.body.email});
        
        if(emailus.password === req.body.password){
            res.status(201).redirect('/index');   
        }
        else {
            res.render('login',{ issues: "Wrong Password or Email" })
        }    
    }catch (error) {
        res.render('login',{ issues: "Wrong Password or Email" })
     }
})

app.get('/index',async (req, res)=>{
    Formpro.find().exec((err , users)=>{
        if(err){
            res.json({message: err.message});
        }
        else {
            res.render("index", {
                users: users, 
            });
        }
    })
})


app.get('/paymentform', function (req, res) {
    res.render("paymentform", { issue: "" });
})

app.post('/paymentform', (req, res) => {
    // console.log(req.body);
            //    console.log(hash); //hashed password
            let newperson2 = new Formpay({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                Amount: req.body.Amount
            })

            newperson2.save();
       
        // res.send("akdm ok ache");
        res.redirect("/paybut")
    })
app.get('/paybut', function (req, res) {
        res.render("paybut");
    })
app.get('/feedback2',async (req, res)=>{
        res.render("feedback2"); 
    })
    
app.post('/feedback2', (req, res) => {
        // console.log(req.body);
                //    console.log(hash); //hashed password
                let newperson = new Formfeed({
                   
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    email: req.body.email,
                    countryCode: req.body.countryCode,
                    phone: req.body.phone,
                    Time: req.body.Time,
                    Comments: req.body.Comments
                })
    
                newperson.save();
           
            // res.send("akdm ok ache");
            res.redirect("/feedback2");
    })



/************************************************************************************************************************************************/


//************** ADMIN  Side dashboard******************************/
//admin login
app.get('/adminlogin', function (req, res) {
    res.render("adminlogin",{issues :null});
})
app.post("/adminlogin", async(req, res) =>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const emailus = await Formadm.findOne({email: req.body.email});
        
        if(emailus.password === req.body.password){
            res.status(201).redirect('/admindashboard');   
        }
        else {
            res.render('adminlogin',{ issues: "Wrong Password or Email" })
        }    
    }catch (error) {
        res.render('adminlogin',{ issues: "Wrong Password or Email" })
     }
})
// Admin DashBoard 
app.get('/admindashboard',async (req, res)=>{
    Formpro.find().exec((err , users)=>{
        if(err){
            res.json({message: err.message});
        }
        else {
            res.render("admindashboard", {
                users: users, 
            });
        }
    }) 
  
})

//Add users Page
app.get('/addusersda',async (req, res)=>{
    res.render("addusersda", { issue: "",
    });
})
app.get('/adminadd', function (req, res) {
    res.render("addusersda", { issue: "" });
})
app.post('/adminadd', (req, res) => {
    // console.log(req.body);

    if (req.body.password === req.body.passwordConfirmation) {

            //    console.log(hash); //hashed password
            let newperson = new Formadm({
               
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                countryCode: req.body.countryCode,
                phone: req.body.phone,
                password: req.body.password,
                passwordConfirmation: req.body.passwordConfirmation
            })

            newperson.save();
       
        // res.send("akdm ok ache");
        res.render("addusersda",{issues : null})
       
    }
    else {
        res.render("addusersda", { issue: "passwords are not same" })
    }
})
app.get('/owneradd', function (req, res) {
    res.render("addusersda", { issue: "" });
   })
app.post('/owneradd', (req, res) => {
    // console.log(req.body);

    if (req.body.password === req.body.passwordConfirmation) {

            //    console.log(hash); //hashed password
            let newperson = new Formown({
               
                ownname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                countryCode: req.body.countryCode,
                phone: req.body.phone,
                location: req.body.location,
                password: req.body.password,
                passwordConfirmation: req.body.passwordConfirmation
            })

            newperson.save();
       
        // res.send("akdm ok ache");
        res.render("addusersda",{issues : null})
       
    }
    else {
        res.render("addusersda", { issue: "passwords are not same" })
    }
})
app.get('/endusersadd', function (req, res) {
    res.render("addusersda", { issue: "" });
   })
app.post('/endusersadd', (req, res) => {
if (req.body.password === req.body.passwordConfirmation) {
let newperson = new Form({
firstname: req.body.firstname,
lastname: req.body.lastname,
email: req.body.email,
countryCode: req.body.countryCode,
phone: req.body.phone,
location: req.body.location,
password: req.body.password,
passwordConfirmation: req.body.passwordConfirmation
})
newperson.save();
res.render("addusersda",{issues : null})
}
else {
res.render("addusersda", { issue: "passwords are not same" })
}
})
//users list Page and functions
app.get('/listusers',getadmindb, getownerdb ,getenduserdb,renderForm);
           function getadmindb( req,res,next) {
                Formadm.find().exec((err , admindatils)=>{
                    if(err) next (err);
                        res.locals.savedadmin = admindatils;
                        next();
                    });
                }
            function getownerdb( req,res,next) {
                Formown.find().exec((err , ownerdatils)=>{
                        if(err) next (err);
                            res.locals.savedowner = ownerdatils;
                            next();
                        });
            }
            function getenduserdb( req,res,next) {
                Form.find().exec((err , enduserdatils)=>{
                    if(err) next (err);
                    res.locals.savedenduser = enduserdatils;
                    next();
                });
            }
            function renderForm(req, res) {
                res.render("listusers");
            };

// Edit, Update and Delet For Admin user
app.get('/edit/:id', (req, res)=>{
                    let id = req.params.id;
                    Formadm.findById(id,(err, user)=>{
                        if(err){
                            res.redirect('/');

                        } else {
                            if(user == null){
                                res.redirect('/');
                            } else {
                                res.render('editusers', {
                                   user: user, 
                                 });
                            }
                        }
                    })
                })
app.post('/edit/:id', async(req, res) => {
                let id = req.params.id;
                Formadm.findByIdAndUpdate(id, {
                    
                    firstname: req.body.firstname,
                    lastname:  req.body.lastname,
                    email:      req.body.email,
                    phone :     req.body.phone,
                    password:   req.body.password,
                    passwordConfirmation: req.body.passwordConfirmation,
                
                }, {new : true, runValidators: true},
                 (err , result) =>{
                    if(err){
                        res.json({message: err.message, type: "danger"});

                    } else {
                        req.session.message = {
                            type: "success", 
                            message: "Admin Details Update successfully",
                        }
                        res.redirect('/listusers');
                    }
                }) 
                   
 }); 
//delete Admin
app.get('/delete/:id', (req, res)=>{
                let id = req.params.id;

                Formadm.findByIdAndRemove(id, (err, result)=>{
                    if(err){
                        res.json({message: err.message, type: "danger"});

                    } else {
                        req.session.message = {
                            type: "success", 
                            message: "Admin Details Delete successfully",
                        }
                        res.redirect('/listusers');
                    }
                })
            })      
//*******
//Edit and Delet For owner user
app.get('/editowner/:id', (req, res)=>{
                    let id = req.params.id;
                    Formown.findById(id,(err, user)=>{
                        if(err){
                            res.redirect('/');

                        } else {
                            if(user == null){
                                res.redirect('/');
                            } else {
                                res.render('editowner', {
                                   user: user, 
                                 });
                            }
                        }
                    })
                })
app.post('/editowner/:id', async(req, res) => {
                let id = req.params.id;
                Formown.findByIdAndUpdate(id, {
                    
                    ownname: req.body.ownname,
                    owndecp:  req.body.owndecp,
                    email:      req.body.email,
                    phone :     req.body.phone,
                    password:   req.body.password,
                    passwordConfirmation: req.body.passwordConfirmation,
                
                }, {new : true, runValidators: true},
                 (err , result) =>{
                    if(err){
                        res.json({message: err.message, type: "danger"});

                    } else {
                        req.session.message = {
                            type: "success", 
                            message: "Owner Details Update successfully",
                        }
                        res.redirect('/listusers');
                    }
                }) 
                   
            }); 
//delete  Owner
app.get('/deleteowner/:id', (req, res)=>{
                let id = req.params.id;

                Formown.findByIdAndRemove(id, (err, result)=>{
                    if(err){
                        res.json({message: err.message, type: "danger"});

                    } else {
                        req.session.message = {
                            type: "success", 
                            message: " Owner Details Delete successfully",
                        }
                        res.redirect('/listusers');
                    }
                })
            })
//*******
//Edit and Delet For End user
app.get('/editenduse/:id', (req, res)=>{
                    let id = req.params.id;
                    Form.findById(id,(err, user)=>{
                        if(err){
                            res.redirect('/');

                        } else {
                            if(user == null){
                                res.redirect('/');
                            } else {
                                res.render('editenduse', {
                                   user: user, 
                                 });
                            }
                        }
                    })
                })
app.post('/editenduse/:id', async(req, res) => {
                let id = req.params.id;
                Form.findByIdAndUpdate(id, {
                    
                    firstname: req.body.firstname,
                    lastname:  req.body.lastname,
                    email:      req.body.email,
                    phone :     req.body.phone,
                    password:   req.body.password,
                    passwordConfirmation: req.body.passwordConfirmation,
                
                }, {new : true, runValidators: true},
                 (err , result) =>{
                    if(err){
                        res.json({message: err.message, type: "danger"});

                    } else {
                        req.session.message = {
                            type: "success", 
                            message: "EndUser Details Update successfully",
                        }
                        res.redirect('/listusers');
                    }
                }) 
                   
            }); 
//delete users
 app.get('/deletenduse/:id', (req, res)=>{
                let id = req.params.id;

                Form.findByIdAndRemove(id, (err, result)=>{
                    if(err){
                        res.json({message: err.message, type: "danger"});

                    } else {
                        req.session.message = {
                            type: "success", 
                            message: "EndUsers Details Delete successfully",
                        }
                        res.redirect('/listusers');
                    }
                })
            })
//*******
//Add property 
app.get('/addproperty',async (req, res)=>{
    res.render("addproperty", { issue: "",
    });
})
app.post('/addproperty', uplaod.single('Imageup'),(req, res) => {
    // console.log(req.body);

    if (req.body.password === req.body.passwordConfirmation) {

            //    console.log(hash); //hashed password
            let newperson1 = new Formpro({
                protype: req.body.protype,
                builtyear: req.body.builtyear,
                country: req.body.country,
                Procity: req.body.Procity,
                locationurl: req.body.locationurl,
                proname: req.body.proname ,
                description: req.body.description,
                Imageup :req.file.filename,
                Sq: req.body.Sq ,
                price: req.body.price,
                Beds: req.body.Beds,
                dyning:req.body.dyning,
                Bath: req.body.Bath,
                Belcony: req.body.Belcony,
                Sharing: req.body.Sharing,
                aircondition: req.body.aircondition,
                otherfeature: req.body.otherfeature,
                fullname: req.body.fullname,
                email: req.body.email,
                phone: req.body.phone,
                instagram: req.body.instagram,
                twitter: req.body.twitter,
                whatsapp: req.body.whatsapp,
            })

            newperson1.save();
       
        // res.send("akdm ok ache");
        res.render("addproperty",{issues : null})
    }
    else {
        res.render("addproperty", { issue: "Passwords are not same" })
    }
})
//list property page get and post
app.get('/listproperty', (req, res)=>{
    Formpro.find().exec((err , users)=>{
        if(err){
            res.json({message: err.message});
        }
        else {
            res.render("listproperty", {
                users: users, 
            });
        }
    }) 
})
//edit and update
app.get('/editproperty/:id', (req, res)=>{
    let id = req.params.id;
    Formpro.findById(id,(err, user)=>{
        if(err){
            res.redirect('/');

        } else {
            if(user == null){
                res.redirect('/');
            } else {
                res.render('editproperty', {
                   user: user, 
                 });
            }
        }
    })
})
app.post('/editproperty/:id', uplaod.single('Imageup'), async(req, res) => {
let id = req.params.id;
let new_image = '';

if(req.file){
    new_image = req.file.filename;
    try{
        fs.unlinkSync("public/photos/uploads/" + req.body.old_image);    
    } catch(err) {
        console.log(err);
    }
} else {
    new_image = req.body.old_image;
}


Formpro.findByIdAndUpdate(id, {
    
    protype: req.body.protype,
    builtyear: req.body.builtyear,
    country: req.body.country,
    Procity: req.body.Procity,
    locationurl: req.body.locationurl,
    proname: req.body.proname ,
    description: req.body.description,
    Imageup : new_image,
    Sq: req.body.Sq ,
    price: req.body.price,
    Beds: req.body.Beds,
    dyning:req.body.dyning,
    Bath: req.body.Bath,
    Belcony: req.body.Belcony,
    Sharing: req.body.Sharing,
    aircondition: req.body.aircondition,
    otherfeature: req.body.otherfeature,
    fullname: req.body.fullname,
    email: req.body.email,
    phone: req.body.phone,
    instagram: req.body.instagram,
    twitter: req.body.twitter,
    whatsapp: req.body.whatsapp,

}, {new : true, runValidators: true},
 (err , result) =>{
    if(err){
        res.json({message: err.message, type: "danger"});

    } else {
        req.session.message = {
            type: "success", 
            message: "Property Details Update successfully",
        }
        res.redirect('/listproperty');
    }
}) 
   
}); 
//delete property
app.get('/deleteproperty/:id',(req, res)=>{
let id = req.params.id;

Formpro.findByIdAndRemove(id, (err, result)=>{
    if(result.Imageup != '') {
        try{
            fs.unlinkSync('public/photos/uploads/' + result.Imageup);
        } catch (err) {
            console.log(err);
        }
    }

    if(err){
        res.json({message: err.message, type: "danger"});

    } else {
        req.session.message = {
            type: "success", 
            message: "Property Details Delete successfully",
        }
        res.redirect('/listproperty');
    }
})
})
//*******
//feedbacks
app.get('/listfeedbacks',async (req, res)=>{
    Formfeed.find().exec((err , users)=>{
        if(err){
            res.json({message: err.message});
        }
        else {
            res.render("listfeedbacks", {
                users: users, 
            });
        }
    })  
        })
app.get('/deletefeed/:id', (req, res)=>{
            let id = req.params.id;

            Formfeed.findByIdAndRemove(id, (err, result)=>{
                if(err){
                    res.json({message: err.message, type: "danger"});

                } else {
                    req.session.message = {
                        type: "success", 
                        message: "FeedBacks Details Delete successfully",
                    }
                    res.redirect('/listfeedbacks');
                }
            })
        })
//*******
//payments list
app.get('/listpayment',async (req, res)=>{
    Formpay.find().exec((err , users)=>{
        if(err){
            res.json({message: err.message});
        }
        else {
            res.render("listpayment", {
                users: users, 
            });
        }
    })  
        })

app.get('/deletepay/:id', (req, res)=>{
            let id = req.params.id;

            Formpay.findByIdAndRemove(id, (err, result)=>{
                if(err){
                    res.json({message: err.message, type: "danger"});

                } else {
                    req.session.message = {
                        type: "success", 
                        message: "Payments Details Delete successfully",
                    }
                    res.redirect('/listpayment');
                }
            })
        })
//*******



















//ownereg get and post
//index page get and post  old version to declare database
/* const ownerdetails =  Formown.find({});
app.get('/index',async (req, res)=>{
    ownerdetails.exec(function(error, data){
        if(error){
            console.log(error);
        }
        res.render('index', {record : data , error: false});
        
        })
    })
 */
//index page get and post  new version to declare database
//owner login get and post




//payment form  get and post



//************** Admin Side and Dashboard,******************************/



//admin login  get and post for regist and login



    //dashboard Profit
   
    const admindetails =  Formadm.find({});

    app.get('/dashprofile',async (req, res)=>{
        admindetails.exec(function(error, data){
            if(error){
                console.log(error);
            }
            res.render('dashprofile', {record : data , error: false});
            
            })
            
            })
      
//*************** list of user only one way to reander *****************************/
            // useing for update
         /*    app.get('/listusers', (req, res)=>{
                Formadm.find().exec((err , users)=>{
                    if(err){
                        res.json({message: err.message});
                    }
                    else {
                        res.render("listusers", {
                            users: users, 
                        });
                    }
                }) 
            })
 */
//*************** list of user only one way to reander *****************************/


            // in it how we can reander multiple databe base in on page 
            




      


 


//***************************************************************/




