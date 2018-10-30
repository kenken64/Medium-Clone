require('dotenv').config();
const express = require('express'),
      path = require('path'),
      admin = require('firebase-admin'),
      { Storage } = require('@google-cloud/storage'),
      bodyParser = require('body-parser'),
      uuidv4 = require('uuid/v4'),
      multer = require("multer"),
      mysql = require("mysql"),
      jwt = require('jsonwebtoken'),
      crypto = require('crypto'),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      auth = require('./auth'),
      cors = require('cors');

const app = express();

const API_URI = "/api";
app.use(cors());
app.use(passport.initialize());
//set GOOGLE_APPLICATION_CREDENTIALS=/Users/phangty/Projects/paf-day26/onfire.json
// Initialize Firebase
const credFile = process.env.Svc_Cred_File || "./ngx-blog.json";

var serviceAccount = require(credFile);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

var db = admin.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
db.settings(settings);

var authorsCollection = db.collection('authors');
var articlesCollection = db.collection('articles');
var categoriesCollection = db.collection('categories');


const sqlInsertUser = "INSERT INTO USER (email, password, fullname, salt) VALUES (?, ?, ?, ?)";
const sqlFindUserByEmail = "SELECT * FROM USER WHERE email = ?";

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONLIMIT,
    debug: false
});

var makeQuery = (sql, pool)=>{
    console.log(sql);
    
    return  (args)=>{
        let queryPromsie = new Promise((resolve, reject)=>{
            pool.getConnection((err, connection)=>{
                if(err){
                    reject(err);
                    return;
                }
                console.log(args);
                connection.query(sql, args || [], (err, results)=>{
                    connection.release();
                    if(err){
                        reject(err);
                        return;
                    }
                    console.log(">>> "+ results);
                    resolve(results); 
                })
            });
        });
        return queryPromsie;
    }
}

var insertUser = makeQuery(sqlInsertUser, pool);
var findUserByEmail = makeQuery(sqlFindUserByEmail, pool);

//export Google_Application_Credentials
const gStorage = new Storage({
      projectId: process.env.FIREBASE_PROJECT_ID
});

const bucket = gStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
const googleMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 //20MB
    }
})

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function(email, password, done) {
    findUserByEmail([email]).then((result)=>{
        if(result.length > 0){
            if(isPasswordValid(password, result[0].password, result[0].salt)){
                console.log("ITS MATCH !");
                return done(null, result[0]);
            }else{
                return done(null, false, {errors: {'email or password': 'is invalid'}});
            }
        }else{
            return done(null, false, {errors: {'email or password': 'is invalid'}});
        }
    }).catch(done)
  
}));

function convertPasswordToHash(password){
    salt = crypto.randomBytes(Math.ceil(16/2))
            .toString('hex') 
            .slice(0,16); 
    const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    console.log("SALT 1> ", salt);
    let hashObj = {
        salt: salt,
        hash: key.toString('hex')
    }
    return hashObj;
}

function isPasswordValid(password, currentHash, salt){
    const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    return key.toString('hex') === currentHash;
}

app.post(API_URI + '/register', bodyParser.urlencoded({ extended: true}), bodyParser.json({ limit: "50MB" }), (req, res)=>{
    console.log("Post backend register");
    let registerForm = req.body;
    let registrationObj = {...registerForm};
    console.log(JSON.stringify(registrationObj));
    let convertSecObj = convertPasswordToHash(registrationObj.password);
    registrationObj.password = convertSecObj.hash;
    registrationObj.salt = convertSecObj.salt;
    
    insertUser([registrationObj.email, 
        registrationObj.password, 
        registrationObj.fullName,
        registrationObj.salt]).then((results)=>{
        console.log(results);
        res.status(200).json({user: registrationObj});
    }).catch((error)=>{
        console.log(error);
        res.status(500).json(error);
    });
})

app.post(API_URI + '/login', bodyParser.urlencoded({ extended: true}), bodyParser.json({ limit: "50MB" }), (req, res, next)=>{
    let user = {...req.body};
    let email = user.email;
    let password = user.password;

    if(!email){
        return res.status(422).json({errors: {email: "can't be blank"}});
      }
    
      if(!password){
        return res.status(422).json({errors: {password: "can't be blank"}});
      }
    
    passport.authenticate('local', {session: false}, function(err, user, info){
        if(err){ return next(err); }
        var today = new Date();
        var exp = new Date(today);
        exp.setDate(today.getDate() + 60);
        let token = jwt.sign({
            id: user.id,
            username: user.email,
            exp: parseInt(exp.getTime() / 1000),
        }, process.env.JWT_SECRET);
        
        if(user){
        //  console.log("JWT token > ", token);
          user.token = token;
          return res.json({user: user});
        } else {
          return res.status(422).json(info);
        }
      })(req, res, next);
    
})

app.get(API_URI + '/user', auth.required, function(req, res, next){
    console.log(req.payload.id);
    return res.json({});
});

app.post(API_URI + '/changePassword', (req, res)=>{
    res.status(200).json({});
})

app.post(API_URI + '/resetPassword', (req, res)=>{
    res.status(200).json({});
})

/////////////////////////// READ ///////////////////////////////////////////
// GET array of authors
app.get(API_URI + '/authors', auth.required, (req, res) => {
    authorsCollection
    .get()
    // console.log(authorsCollection)
    .then(snapshot => {
        let authorsArr = [];
        snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            var returnResult = {
                id: doc.id,
                result: doc.data()
            }
            authorsArr.push(returnResult);       
    });
    res.status(200).json(authorsArr);
   })
   .catch(err => {
     console.log('Error getting documents', err);
     res.status(500).json(err);
  }); 
});

// Search by firstname & lastname
app.get(API_URI + '/author', auth.required, (req, res) => {
    let firstname = req.query.firstname;
    let lastname = req.query.lastname;
    console.log(firstname, lastname);

    if (typeof(firstname === 'undefined') 
        && typeof(lastname === 'undefined')){
        if (firstname === ''
        && lastname === ''){
        console.log('firstname and lastname are undefined');
        res.status(500).json({error: "firstname and lastname are undefined"});
        }
    }

    authorsCollection
        .where('firstname', '==', firstname)
        .where('lastname', '==', lastname)
    .get()
    .then((result) => {
        let authorData = []
    
        authorData = result.docs.map(value => {
            return value.data();
        });

        res.status(200).json(authorData)
     })
     .catch(err => {
        console.log('Error getting documents', err);
        res.status(500).json(err);
    })
});


/**
 * get author by id.
 */
app.get(API_URI + '/authors/:id', auth.required,(req, res) => {
    let idValue = req.params.id;
    
    authorsCollection.
        doc(idValue)
    .get()
    .then((result) => {
        console.log(result.data());
        var returnResult = {
            id: idValue,
            firstname : result.data().firstname,
            lastname: result.data().lastname,
            email: result.data().email,
            profile: result.data().profile
        }
        res.status(200).json(returnResult)
     })
     .catch(err => {
        console.log('Error getting documents', err);
        res.status(500).json(err);
    })
});

// GET array of articles by topic
app.get(API_URI + '/articles', (req, res) => {
    articlesCollection
    .get()
    .then(snapshot => {
        // No need to push to an array because we're using map here to create a new array
        let snapshotPromises = snapshot.docs.map(doc => {
            const authorId = doc.data().author;
            let articleData = doc.data();

            if (typeof authorId !== 'undefined') {
                const authorRef = authorsCollection.doc(authorId);
                return authorRef.get().then(authorSnapshot => {
                    articleData.authorName = authorSnapshot.data().firstname + ' ' + authorSnapshot.data().lastname;
                    return articleData;
                });
            } else {
                return articleData;
            }
        });

        Promise.all(snapshotPromises).then(results => {
            console.log(results);
            res.status(200).json(results);
        });
   })
   .catch(err => {
        console.log('Error getting documents', err);
        res.status(500).json(err);
  }); 
});

// GET one article by title
app.get(API_URI + '/article', auth.required,(req, res) => {
    let title = req.query.title
    console.log(title);
    if (typeof(title === 'undefined')){
        if (title === '' ){
            console.log('title is undefined');
            res.status(500).json({error: "title is undefined"});
        }
    }
    articlesCollection
        .where('title', '==', title)
    .get()
    .then(snapshot => {
        let articlesData = snapshot.docs.map(doc => {
            return doc.data();
        });
        res.status(200).json(articlesData);
      })
      .catch(err => {
          console.log('Error getting documents', err);
          res.status(500).json(err);
     });
  });

///////////////// CREATE //////////////////////////////
  // Add one author
app.post(API_URI + '/authors', auth.required, bodyParser.urlencoded({ extended: true}), bodyParser.json({ limit: "10MB" }), (req, res) => { 
    let author = { ...req.body };
    console.log(".....author" + JSON.stringify(author));
    authorsCollection
        .add(author)
        .then(result => res.status(200).json("Author name added"))
        .catch(error => res.status(500).json(error));
})

// Add one article 
app.post(API_URI + '/articles', auth.required, bodyParser.urlencoded({ extended: true}), bodyParser.json({ limit: "50MB" }), (req, res) => {
    let article = {... req.body };
    console.log(".....articles" + JSON.stringify(article));
    articlesCollection
        .add(article)
        .then(result => res.status(200).json("Article added"))
        .catch(error => res.status(500).json(error));
});

app.post(API_URI + '/categories', auth.required, bodyParser.urlencoded({ extended: true}), bodyParser.json({ limit: "50MB" }), (req, res) => {
    let category = {... req.body };
    console.log(".....categories" + JSON.stringify(category));
    categoriesCollection
        .add(category)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json(error));
});

app.get(API_URI + '/categories', auth.required,(req, res) => {
    categoriesCollection
    .get()
    .then(snapshot => {
        let categoriesArr = [];
        snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
            var returnResult = {
                id: doc.id,
                result: doc.data()
            }
            categoriesArr.push(returnResult);       
    });
    res.status(200).json(categoriesArr);
   })
   .catch(err => {
     console.log('Error getting documents', err);
     res.status(500).json(err);
  }); 
});


app.put(API_URI + '/categories', auth.required, bodyParser.urlencoded({ extended: true }), bodyParser.json({ limit: "10MB" }), (req, res) => {
    console.log(JSON.stringify(req.body));
    let category = {... req.body};
    let idValue = category.id
    console.log(idValue);
    categoriesCollection.doc(idValue).update(
        category,
        { merge: true });
        console.log(category) 
    res.status(200).json(category);
});

//////////////// UPDATE ////////////
// Edit author
app.put(API_URI + '/authors', auth.required, bodyParser.urlencoded({ extended: true }), bodyParser.json({ limit: "10MB" }), (req, res) => {
    //console.log("xxxx" + JSON.stringify(req));
    console.log(JSON.stringify(req.body));
    let author = {... req.body};
    console.log(author);
    let idValue = author.id
    console.log(">>>> " + idValue);
    authorsCollection.doc(idValue).update(
        author,
        { merge: true });
        console.log(author) 
    res.status(200).json(author);
});

// Edit article
app.put(API_URI + '/article/:id', auth.required, bodyParser.urlencoded({ extended: true }), bodyParser.json({ limit: "50MB" }), (req, res) => {
    let idValue = req.params.id;
    console.log(idValue);
    console.log(JSON.stringify(req.body));
    let article = {... req.body};
    articlesCollection.doc(idValue).update(
        article,
        { merge: true });
        console.log(article)
    res.status(200).json(article);
});


//Upload single image
app.post(API_URI + '/upload', auth.required, googleMulter.single('img'), (req, res) => {
        console.log("....uploading: ");
        if(req.file != null) {
           console.log("uploaded");
           uploadToFirebaseStorage(req.file).then((result) => {
               console.log(result);
               res.status(200).json(result)
           }).catch((error) => {
               console.log(error);
               res.status(500).json(error);
           })
        } else {
            res.status(500).json({ error: "error in uploading"});
        }
    });

const uploadToFirebaseStorage = (fileObject) => {
    return new Promise((resolve, reject) => {
        if(!fileObject) {
            reject("Invalid file upload attempt");
        }

        let idValue =  uuidv4();
        let newFilename = `${idValue}_${fileObject.originalname}`
        let firebaseFileUpload = bucket.file(newFilename);
        
        const blobStream = firebaseFileUpload.createWriteStream({
            metadata: {
                contentType: fileObject.mimeType
            }
        });

        blobStream.on("error", (error) => {
            console.log("error uploading" + error);
            reject("Error uploading file!");
        });

        blobStream.on("finish", () => {
            console.log("Uploading completed");
            let firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/day26-38142.appspot.com/o/${firebaseFileUpload.name}?alt=media&token=5aa67a11-cc55-4c04-9a39-177ab8dca9cc`;
            fileObject.fileURL = firebaseUrl;
            console.log(firebaseUrl);
            resolve(firebaseUrl);
        });

        blobStream.end(fileObject.buffer);
    });
}

////////////////// DELETE ///////////////////////////////
app.delete(API_URI + '/delete/articles/:id', auth.required, (req, res) => {
    let idValue = req.params.id;
    articlesCollection.doc(idValue).delete().then((result) => {
        res.status(200).json(result);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

app.delete(API_URI + '/authors', auth.required,(req, res) => {
    let idValue = req.query.id;
    authorsCollection.doc(idValue).delete().then((result) => {
        res.status(200).json(result);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

//////////////// Static Assets ////////////////////////
app.use(express.static(path.join(__dirname, '/public/mini-client_angular')));

const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;
app.listen(PORT, () => {
    console.info(`Application started on port %d at %s`, PORT, new Date());
})