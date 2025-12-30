# Admin System Setup Guide

This guide will help you set up and use the comprehensive admin system for the Fresh Harvest e-commerce platform.

## 🚀 Quick Setup

### 1. Create Initial Admin User

Run the admin setup script to create your first admin user:

```bash
cd backend
npm run setup-admin
```

**Default Admin Credentials:**
- Email: `admin@freshharvest.com`
- Password: `admin123456`

### 2. Custom Admin Setup

You can create a custom admin user with specific credentials:

```bash
cd backend
npm run setup-admin -- --email your-admin@email.com --password yourpassword --name "Your Name"
```

### 3. Start the Application

```bash
# Start backend server
cd backend
npm start

# Open frontend in browser
# Navigate to frontend/admin.html or use Live Server
```

## 🔐 Admin Access

1. Open your browser and go to the admin dashboard: `frontend/admin.html`
2. Login with your admin credentials
3. You'll be redirected to the admin dashboard

## 📊 Admin Dashboard Features

### Overview Tab
- **Dashboard Statistics**: View total users, products, orders, and revenue
- **Recent Activity**: Monitor latest orders and system activity
- **Quick Actions**: Fast access to common admin tasks

### Users Management
- **View All Users**: Browse all registered users with pagination
- **Create Users**: Add new customers, vendors, or admins
- **Edit Users**: Update user information and roles
- **Delete Users**: Remove users from the system
- **Role Management**: Assign roles (Customer, Vendor, Admin)
- **Status Control**: Activate/deactivate user accounts

### Products Management
- **View All Products**: Browse all products across all vendors
- **Create Products**: Add new products and assign to vendors
- **Edit Products**: Update product information, pricing, and stock
- **Delete Products**: Remove products from the system
- **Status Control**: Activate/deactivate products
- **Vendor Assignment**: Assign products to specific vendors

### Orders Management
- **View All Orders**: Monitor all orders in the system
- **Order Status Updates**: Change order status (Pending → Confirmed → Shipped → Delivered)
- **Order Details**: View customer information and order items
- **Order Filtering**: Filter by status and search functionality

### Vendors Management
- **View All Vendors**: Browse all vendor accounts
- **Create Vendors**: Add new vendor accounts
- **Vendor Statistics**: Monitor vendor performance
- **Vendor Control**: Manage vendor access and status

## 🛠 Admin Capabilities

### User Operations
```javascript
// Create a new user
POST /api/admin/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user|vendor|admin",
  "phone": "+1234567890"
}

// Update user
PUT /api/admin/users/:id
{
  "name": "Updated Name",
  "role": "vendor",
  "isActive": true
}

// Delete user
DELETE /api/admin/users/:id
```

### Product Operations
```javascript
// Create a new product
POST /api/admin/products
{
  "name": "Fresh Orange Juice",
  "description": "100% pure orange juice",
  "category": "fruit-juice",
  "subcategory": "citrus",
  "price": 4.99,
  "stock": 100,
  "unit": "l",
  "vendor": "vendor_id",
  "images": ["image_url"]
}

// Update product
PUT /api/admin/products/:id

// Delete product
DELETE /api/admin/products/:id

// Toggle product status
PUT /api/admin/products/:id/status
{
  "isActive": false
}
```

### Order Operations
```javascript
// Get all orders
GET /api/admin/orders?page=1&limit=10&status=pending

// Update order status
PUT /api/admin/orders/:id/status
{
  "orderStatus": "confirmed"
}
```

## 🔒 Security Features

- **Role-based Access Control**: Only admin users can access admin functions
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: All inputs are validated and sanitized
- **Password Hashing**: User passwords are securely hashed
- **Self-Protection**: Admins cannot delete their own accounts

## 📱 User Interface

### Dashboard Layout
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Tab Navigation**: Easy switching between different management sections
- **Modal Forms**: Clean popup forms for creating/editing
- **Real-time Updates**: Instant feedback on all operations
- **Search & Filter**: Find users, products, and orders quickly

### Visual Indicators
- **Status Badges**: Clear visual status indicators
- **Role Badges**: Color-coded user roles
- **Action Buttons**: Intuitive edit/delete/toggle buttons
- **Loading States**: Visual feedback during operations

## 🚨 Important Security Notes

1. **Change Default Password**: Always change the default admin password after first login
2. **Secure Environment**: Use HTTPS in production
3. **Environment Variables**: Store sensitive data in environment variables
4. **Regular Backups**: Backup your database regularly
5. **Access Logs**: Monitor admin access and activities

## 🔧 Troubleshooting

### Common Issues

**Cannot access admin dashboard:**
- Ensure you're logged in with an admin account
- Check that the backend server is running
- Verify the admin role is set correctly

**Admin setup script fails:**
- Check MongoDB connection
- Ensure all dependencies are installed
- Verify database permissions

**Features not working:**
- Check browser console for errors
- Verify API endpoints are accessible
- Ensure proper authentication tokens

### Reset Admin Password

If you forget the admin password, run the setup script again:

```bash
cd backend
npm run setup-admin
# Choose 'y' when asked to reset password
```

## 📞 Support

For additional support:
1. Check the main README.md file
2. Review the API documentation
3. Check the browser console for errors
4. Verify backend logs for server issues

## 🎯 Next Steps

After setting up the admin system:
1. Create vendor accounts for your suppliers
2. Add product categories and inventory
3. Configure payment and shipping settings
4. Set up monitoring and analytics
5. Train your team on admin operations

---

**Note**: This admin system provides complete control over your e-commerce platform. Use it responsibly and ensure proper access controls are in place.
