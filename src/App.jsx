// src/App.jsx

import { useState, useEffect } from 'react';
import './App.css';
import { db, storage } from './firebase'; 
import { collection, addDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function App() {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle file input change
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Handle form submission (NOW INCLUDES UPLOAD)
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!productName || !price || !image) {
      alert('Please fill in all fields and upload an image.');
      return;
    }

    // Create a reference to the storage location (e.g., 'images/timestamp_filename.jpg')
    const storageRef = ref(storage, `images/${Date.now()}_${image.name}`);
    
    // Start the upload task
    const uploadTask = uploadBytesResumable(storageRef, image);

    // Listen for upload progress and completion
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Update progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error("Error uploading image: ", error);
        alert("Error uploading image. Check console.");
        setUploadProgress(0); // Reset progress
      },
      () => {
        // On successful upload, get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          
          // Now, save the product info (including the URL) to Firestore
          try {
            await addDoc(collection(db, "products"), {
              name: productName,
              price: Number(price),
              imageUrl: downloadURL, // Save the image URL
              createdAt: new Date()
            });
            
            // Reset the form
            setProductName('');
            setPrice('');
            setImage(null);
            setUploadProgress(0);
            document.getElementById("imageInput").value = null; // Clear file input

          } catch (e) {
            console.error("Error adding document: ", e);
            alert("Error saving product to database.");
          }
        });
      }
    );
  };

  // --- READ data from Firebase ---
  useEffect(() => {
    setLoading(true);
    const productsCollection = collection(db, "products");
    const q = query(productsCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="app-container">
      <h1>My Price Tracker</h1>
      
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
        
        {/* --- New File Input --- */}
        <div className="form-group">
          <label htmlFor="imageInput">Product Image</label>
          <input
            id="imageInput"
            type="file"
            accept="image/*" // Only accept image files
            onChange={handleImageChange}
            required
          />
        </div>

        {/* --- Upload Progress Bar --- */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <progress value={uploadProgress} max="100" />
        )}

        {/* Disable button while uploading */}
        <button type="submit" disabled={uploadProgress > 0 && uploadProgress < 100}>
          {uploadProgress > 0 && uploadProgress < 100 ? `Uploading ${uploadProgress.toFixed(0)}%` : 'Add Price'}
        </button>
      </form>

      {/* --- The List (now with images) --- */}
      <div className="price-list">
        <h2>Saved Prices</h2>
        {loading && <p>(Loading prices...)</p>}
        
        {!loading && products.length === 0 && <p>(No prices saved yet)</p>}
        
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {/* Add the image tag */}
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
    </div>
  );
}

export default App;