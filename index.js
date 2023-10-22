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
  id => users.find(user => user.id === id)
)



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

app.listen(process.env.PORT || 3000) 