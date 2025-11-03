// src/components/UserView.jsx

import { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, onSnapshot, orderBy, query } from "firebase/firestore";

// This is the component for regular users
export default function UserView() {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState(''); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !price || !imageUrl) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      await addDoc(collection(db, "products"), {
        name: productName,
        price: Number(price),
        imageUrl: imageUrl,
        createdAt: new Date()
      });
      setProductName('');
      setPrice('');
      setImageUrl('');
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Error saving product to database.");
    }
  };

  useEffect(() => {
    setLoading(true);
    const productsCollection = collection(db, "products");
    const q = query(productsCollection, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = [];
      snapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <form className="add-item-form" onSubmit={handleSubmit}>
        <div className="form-group">
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
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="e.g., https://cdn.discordapp.com/..."
            required
          />
        </div>
        <button type="submit">Add Price</button>
      </form>

      <div className="price-list">
        <h2>Saved Prices</h2>
        {loading && <p>(Loading prices...)</p>}
        {!loading && products.length === 0 && <p>(No prices saved yet)</p>}
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <img src={product.imageUrl} alt={product.name} className="product-image" />
              <div className="product-details">
                <span>
                  {product.name}
                  <small>{product.createdAt.toDate().toLocaleDateString()}</small>
                </span>
              </div>
              <span className="price">RM {product.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}