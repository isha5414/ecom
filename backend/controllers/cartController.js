import userModel from "../models/userModel.js"

import productModel from "../models/productModel.js";


const addToCart = async (req, res) => {
    try {
      const { userId, itemId, size } = req.body;
  
      const userData = await userModel.findById(userId);
      if (!userData) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      let cartData = userData.cartData || {};
  
      if (cartData[itemId]) {
        cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
      } else {
        cartData[itemId] = { [size]: 1 };
      }
  
      await userModel.findByIdAndUpdate(userId, { cartData });
      res.json({ success: true, message: "Product added to cart" });
    } catch (error) {
      console.error("Add to Cart Error:", error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  const removeFromCart = async (req, res) => {
    try {
        const { userId, itemId, size } = req.body;

        console.log("Received Remove Request: ", { userId, itemId, size });

        if (!userId || !itemId || !size) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData || {};

        if (cartData[itemId] && cartData[itemId][size]) {
            if (cartData[itemId][size] > 1) {
                cartData[itemId][size] -= 1;
            } else {
                delete cartData[itemId][size];
                if (Object.keys(cartData[itemId]).length === 0) {
                    delete cartData[itemId];
                }
            }

            await userModel.findByIdAndUpdate(userId, { cartData });

            console.log("Updated Cart Data:", cartData);

            return res.json({ success: true, message: "Removed from Cart", updatedCart: cartData });
        } else {
            return res.status(404).json({ success: false, message: "Item not found in cart" });
        }
    } catch (error) {
        console.error("Error removing from cart:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};



const getCart = async (req, res) => {
    try {
      const { userId } = req.body;
  
      if (!userId) {
        return res.status(400).json({ success: false, message: "Missing userId" });
      }
  
      // Find the user by ID
      const userData = await userModel.findById(userId);
      if (!userData) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      const cartData = userData.cartData || {};
  
      // Fetch all products from the database for the given item IDs
      const itemIds = Object.keys(cartData);
      const products = await productModel.find({ _id: { $in: itemIds } });
  
      // Map through the cart data and attach product details
      const cartWithDetails = products.map((product) => {
        const sizes = cartData[product._id];
        return {
          itemId: product._id,
          name: product.name,
          price: product.price,
          image: product.image[0],
          sizes: Object.keys(sizes).map((size) => ({
            size,
            quantity: sizes[size],
          })),
        };
      });
      console.log("Cart data fetched:", cartWithDetails);
      res.json({ success: true, cart: cartWithDetails });
    } catch (error) {
      console.error("Error fetching cart data:", error);
      res.status(500).json({ success: false, message: "Error fetching cart data" });
    }
  };
  



export {addToCart,removeFromCart,getCart}