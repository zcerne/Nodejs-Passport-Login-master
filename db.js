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

async function getUserEmailByName(db, userName) {
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
  
  async function getUserIdByName(db, userId) {
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
module.exports = { db, getUserEmailByName,  getUserIdByName};