// src/App.jsx

import { useState, useEffect } from 'react'
import './App.css'
// Import our database connection and Firestore functions
import { db } from './firebase' 
import { collection, addDoc, onSnapshot, orderBy, query } from "firebase/firestore"; 

function App() {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  
  // New state for loading and storing products from Firebase
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. WRITE data to Firebase ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !price) {
      alert('Please enter a product name and price.');
      return;
    }

    try {
      // 'products' is the name of our collection in Firestore
      const docRef = await addDoc(collection(db, "products"), {
        name: productName,
        price: Number(price), // Store price as a number
        createdAt: new Date() // Add a timestamp
      });
      console.log("Document written with ID: ", docRef.id);

      // Clear the form
      setProductName('');
      setPrice('');

    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Error saving price. Check console for details.");
    }
  };

  // --- 2. READ data from Firebase (in real-time) ---
  useEffect(() => {
    setLoading(true);
    
    // Create a query to get products, ordered by when they were created
    const productsCollection = collection(db, "products");
    const q = query(productsCollection, orderBy("createdAt", "desc"));

    // onSnapshot listens for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData = [];
      querySnapshot.forEach((doc) => {
        // 'doc.data()' has the data (name, price), 
        // 'doc.id' is the unique document ID
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
      setLoading(false);
    });

    // Cleanup function to stop listening when the component unmounts
    return () => unsubscribe();
  }, []); // The empty array [] means this runs once when the app loads


return (
    <div className="app-container">
      <h1>My Price Tracker</h1>
      
      {/* The Form for adding new items */}
      <form className="add-item-form" onSubmit={handleSubmit}>
        <div className="form-group">
          {/* THIS LABEL WAS MISSING */}
          <label htmlFor="productName">Product Name</label>
          <input
            id="productName"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., Milo 1kg"
            required
          />
        </div>
        <div className="form-group">
          {/* THIS LABEL WAS MISSING */}
          <label htmlFor="price">Price (RM)</label>
          <input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 15.99"
            required
          />
        </div>
        <button type="submit">Add Price</button>
      </form>

      {/* The List of saved prices */}
      <div className="price-list">
        <h2>Saved Prices</h2>
        {loading && <p>(Loading prices...)</p>}
        
        {!loading && products.length === 0 && (
          <p>(No prices saved yet)</p>
        )}
        
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <span>
                {/* THIS IS THE FIX - MAKE SURE {product.name} IS HERE */}
                {product.name}
                <small>{product.createdAt.toDate().toLocaleDateString()}</small>
              </span>
              <span className="price">RM {product.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// DELETE THE STYLE TAG BELOW THIS LINE
// const style = document.createElement('style');
// ... (delete all of this) ...
// document.head.appendChild(style);

export default App;