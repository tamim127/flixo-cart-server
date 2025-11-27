# FlixoCart Backend Server

This is the backend server for **FlixoCart**, a simple eCommerce platform built with **Express.js** and **MongoDB**. It provides APIs for managing products, categories, and user carts. The server supports CORS and JSON requests, making it ready for integration with a frontend application built in **Next.js** or any other framework.

---

## 🛠 Technologies Used

- **Node.js** & **Express.js** – Server and routing
- **MongoDB** – Database for products and cart management
- **dotenv** – Environment variable management
- **cors** – Cross-Origin Resource Sharing
- **MongoDB Driver** – Native driver for MongoDB operations

---

## ⚡ Features

### Product Management
- Get all products (with pagination support)
- Get single product by ID
- Add, update, and delete products
- Filter products by:
  - Category
  - Brand
  - Price range
  - Tags
- Search products by title, description, or tags

### Cart Management
- Get user cart
- Add products to cart (quantity increment)
- Remove single item from cart
- Clear cart completely
- Decrease product quantity in cart

### Additional
- CORS enabled for all origins
- JSON request parsing
- MongoDB connection with retry and strict API settings
- Proper status codes and error handling

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/tamim127/flixo-cart-server.git
cd flixo-cart-server

2. npm install
3. npm start
4. npm install -g nodemon
5. nodemon server.js

📂 API Routes

| Method | Endpoint                               | Description                                          |
| ------ | -------------------------------------- | ---------------------------------------------------- |
| GET    | `/products`                            | Get all products (supports `limit` and `skip` query) |
| GET    | `/products/:id`                        | Get a single product by ID                           |
| POST   | `/products`                            | Add a new product                                    |
| PUT    | `/products/:id`                        | Update a product by ID                               |
| DELETE | `/products/:id`                        | Delete a product by ID                               |
| GET    | `/categories`                          | Get all product categories                           |
| GET    | `/products/category/:name`             | Get products by category                             |
| GET    | `/products/search?q=keyword`           | Search products by title, description, or tags       |
| GET    | `/products/filter?minPrice=&maxPrice=` | Filter products by price range                       |
| GET    | `/products/brand/:brand`               | Filter products by brand                             |
| GET    | `/products/tags/:tag`                  | Filter products by tag                               |
| GET    | `/my-products?sellerId=`               | Get products of a specific seller                    |



# Cart

| Method | Endpoint         | Description                       |
| ------ | ---------------- | --------------------------------- |
| GET    | `/cart?userId=`  | Get user's cart                   |
| POST   | `/cart`          | Add product to cart               |
| PATCH  | `/cart/decrease` | Decrease product quantity in cart |
| DELETE | `/cart/item`     | Remove single item from cart      |
| DELETE | `/cart/clear`    | Clear the entire cart             |


 # Notes

- Ensure that MongoDB Atlas IP whitelist includes your server or local IP.
- All routes return JSON responses.
- Proper HTTP status codes are used for success and errors.
