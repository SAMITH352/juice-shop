# Fresh Harvest - E-commerce Platform

A complete e-commerce website for selling fruit juices and dry fruits, built with Node.js, Express.js, MongoDB, and vanilla JavaScript.

## 🌟 Features

### User Roles & Permissions
- **Admin**: Full access to manage users, vendors, products, and view all orders
- **Vendor**: Can add/edit products and view their sales
- **User**: Can browse products, add to cart, and make purchases

### Core Functionality
- 🔐 **Authentication & Authorization** with JWT tokens
- 🛍️ **Product Management** with categories, search, and filtering
- 🛒 **Shopping Cart** with persistent storage
- 💳 **Order Management** with status tracking
- 📊 **Dashboard** for admin and vendor analytics
- 📱 **Responsive Design** for all devices
- 🔍 **Search & Filter** functionality
- 📄 **Pagination** for products and orders

## 🏗️ Project Structure

```
Full_Stack/
├── backend/                 # Node.js & Express.js backend
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── models/
│   │   ├── User.js         # User model with roles
│   │   ├── Product.js      # Product model
│   │   └── Order.js        # Order model
│   ├── middleware/
│   │   └── auth.js         # Authentication middleware
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── products.js     # Product management routes
│   │   ├── orders.js       # Order management routes
│   │   └── admin.js        # Admin-specific routes
│   ├── package.json        # Backend dependencies
│   └── server.js           # Main server file
│
└── frontend/               # Vanilla JavaScript frontend
    ├── css/
    │   ├── style.css       # Main styles
    │   └── responsive.css  # Responsive design
    ├── js/
    │   ├── api.js          # API service
    │   ├── auth.js         # Authentication module
    │   ├── cart.js         # Cart management
    │   ├── products.js     # Product management
    │   ├── orders.js       # Order management
    │   ├── dashboard.js    # Dashboard functionality
    │   └── app.js          # Main application
    └── index.html          # Main HTML file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   or for development with auto-restart:
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Open index.html in your browser:**
   - Double-click the `index.html` file, or
   - Use a local server like Live Server (VS Code extension)

## 🔧 Configuration

### MongoDB Connection
The application uses MongoDB Atlas. The connection string is configured in `backend/config/db.js`:

```javascript
const conn = await mongoose.connect('mongodb+srv://Amarnath:fullstack@cluster0.y4ed6bz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
```

### Environment Variables
Create a `.env` file in the backend directory (optional):
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get single product (public)
- `POST /api/products` - Create product (vendor/admin)
- `PUT /api/products/:id` - Update product (vendor/admin)
- `DELETE /api/products/:id` - Delete product (vendor/admin)

### Orders
- `POST /api/orders` - Create order (user)
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (vendor/admin)

### Admin
- `GET /api/admin/users` - Get all users (admin)
- `POST /api/admin/vendors` - Create vendor (admin)
- `GET /api/admin/dashboard/stats` - Dashboard statistics (admin)

## 👥 User Roles & Features

### Admin User
- Create and manage vendors
- View all users and their details
- Manage all products (activate/deactivate)
- View system-wide analytics
- Access to all orders and sales data

### Vendor User
- Add new products to the platform
- Edit their own products
- View orders containing their products
- Update order status for their products
- View sales analytics

### Regular User
- Browse and search products
- Add products to cart
- Complete checkout process
- View order history
- Update profile information

## 🛒 Shopping Features

### Product Browsing
- Category-based filtering (Fruit Juices, Dry Fruits)
- Price range filtering
- Search functionality
- Sorting options (price, name, newest)
- Pagination

### Shopping Cart
- Add/remove products
- Update quantities
- Persistent cart storage
- Real-time total calculation
- Tax and shipping calculation

### Checkout Process
- Shipping address collection
- Payment method selection
- Order confirmation
- Email notifications (to be implemented)

## 🎨 UI/UX Features

### Design
- Modern, clean interface
- Green color scheme (fresh/organic theme)
- Responsive design for all devices
- Smooth animations and transitions
- Loading states and feedback

### User Experience
- Intuitive navigation
- Clear product information
- Easy checkout process
- Order tracking
- User-friendly error messages

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Secure API endpoints

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen orientations

## 🚀 Deployment

### Backend Deployment
1. Deploy to platforms like Heroku, Railway, or DigitalOcean
2. Set environment variables
3. Update MongoDB connection string

### Frontend Deployment
1. Deploy to platforms like Netlify, Vercel, or GitHub Pages
2. Update API base URL in `frontend/js/api.js`
3. Ensure CORS is properly configured

## 🛠️ Development

### Adding New Features
1. Backend: Add routes in `routes/` directory
2. Frontend: Add JavaScript modules in `js/` directory
3. Update API service in `api.js`
4. Add corresponding UI components

### Database Schema
The application uses three main collections:
- **Users**: User accounts with roles
- **Products**: Product information with vendor association
- **Orders**: Order details with items and status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Create an issue in the repository
- Check the API documentation
- Review the code comments

## 🔮 Future Enhancements

- Payment gateway integration
- Email notifications
- Product reviews and ratings
- Advanced analytics
- Mobile app development
- Multi-language support
- Inventory management
- Discount and coupon system

---

**Built with ❤️ using Node.js, Express.js, MongoDB, and Vanilla JavaScript**
