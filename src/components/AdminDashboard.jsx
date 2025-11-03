// src/components/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, orderBy, query, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 1. Check if admin is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Not logged in, send back to login page
        navigate('/admin');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2. Fetch products
  useEffect(() => {
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

  // 3. Delete function
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (e) {
        console.error("Error deleting document: ", e);
        alert("Delete failed. See console for details.");
      }
    }
  };

  // 4. Edit function
  const handleEdit = async (id) => {
    const newPrice = prompt("Enter new price (e.g., 15.99):");
    if (newPrice && !isNaN(newPrice)) {
      try {
        const productRef = doc(db, "products", id);
        await updateDoc(productRef, {
          price: Number(newPrice)
        });
      } catch (e) {
        console.error("Error updating document: ", e);
        alert("Update failed. See console for details.");
      }
    } else if (newPrice) {
      alert("Invalid price.");
    }
  };

  // 5. Logout function
  const handleLogout = () => {
    signOut(auth).then(() => navigate('/'));
  };

  if (loading || !user) {
    return <p>Loading Admin Dashboard...</p>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="logout-button">Log Out</button>
      </div>
      <div className="price-list">
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
              <div className="admin-actions">
                <button onClick={() => handleEdit(product.id)} className="edit">Edit</button>
                <button onClick={() => handleDelete(product.id)} className="delete">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}