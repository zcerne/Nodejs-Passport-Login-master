if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')//za avtentikacijo
const flash = require('express-flash') // za prikaz sporočil
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config') //kle bomo spravlal vse v zvezi z gesli
initializePassport(
  passport,
  name => users.find(user => user.name === name),
  //getUserEmailByName,
  //getUserIdByName
  id => users.find(user => user.id === id)
)

// initializePassport(
//   passport,
//   async (name) => {
//     const userEmail = await getUserEmailByName(name);
//     // Assuming you have a list of users, you can check if the email exists
//     const user = users.find((user) => user.email === userEmail);
//     return user;
//   },
//   async (id) => {
//     const user = await getUserById(id);
//     return user;
//   }
// );

const { initializeApp } = require('firebase/app')
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyDwbdiVB8mUXM0ghmnTSgF01eEjV6HnJjY",
    authDomain: "buhtli-spletna-stran.firebaseapp.com",
    projectId: "buhtli-spletna-stran",
    storageBucket: "buhtli-spletna-stran.appspot.com",
    messagingSenderId: "1017365393560",
    appId: "1:1017365393560:web:25300aa935358bc7b0e0ed"
};

// // init firebase
initializeApp(firebaseConfig)

// // init services
const db = getFirestore()
// const users = collection(db, 'users')


async function getUserEmailByName(userName) {
  const usersCollection = collection(db, 'users');

  // Create a query to find the user document with a matching 'name' field
  const queryByName = query(usersCollection, where('name', '==', userName));
  try {
    const querySnapshot = await getDocs(queryByName);
    
    if (querySnapshot.size === 0) {
      throw new Error('No user found with that name.');
    }

    // Assuming there is only one user with the given name
    const userDoc = querySnapshot.docs[0];
    // Access the 'email' field from the user document
    const userName = userDoc.data().name;
    return userName;
  } catch (error) {
    console.error('Error getting user by name: ', error);
    return null; // Handle the error or return a default value
  }
}

async function getUserIdByName(userId) {
  const usersCollection = collection(db, 'users');

  // Create a query to find the user document with a matching 'name' field
  const queryByName = query(usersCollection, where('id', '==', userId));

  try {
    const querySnapshot = await getDocs(queryByName);

    if (querySnapshot.size === 0) {
      throw new Error('No user found with that name.');
    }

    // Assuming there is only one user with the given name
    const userDoc = querySnapshot.docs[0];

    // Access the 'email' field from the user document
    const userEmail = userDoc.data().email;
    return userEmail;
  } catch (error) {
    console.error('Error getting user by name: ', error);
    return null; // Handle the error or return a default value
  }
}
// getUserEmailByName("stempl").then(email => console.log(email))


const users = [] //seznam uporabnikov

app.set('view-engine', 'ejs')

//kao da dostopamo do variabel email, password znotraj request metod -> req.body.name
//ubistvu v login.ejs pošle kr ceu form v request
app.use(express.urlencoded({ extended: false })) 
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET, //zakriptira vse informacije
  resave: false, // če se nič ne spremeni ali ponovno shranimo
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10) //sam zahešej geslo, nerabš
    //zgorej je list uporabnikov
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      password: hashedPassword
    })
    //ko se registriramo me preusmeri
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
  console.log(users)
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()//nadaljuj kar si mislu nadaljevt
}

app.listen(3000)