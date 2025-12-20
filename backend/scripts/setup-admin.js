const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// MongoDB connection string - same as in config/db.js
const MONGODB_URI = 'mongodb+srv://Amarnath:fullstack@cluster0.y4ed6bz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Default admin credentials
const DEFAULT_ADMIN = {
  name: 'System Administrator',
  email: 'admin@freshharvest.com',
  password: 'admin123456',
  role: 'admin',
  phone: '+1234567890',
  address: {
    street: '123 Admin Street',
    city: 'Admin City',
    state: 'Admin State',
    zipCode: '12345',
    country: 'USA'
  }
};

async function setupAdmin() {
  try {
    console.log('🚀 Setting up admin user...');
    console.log('================================');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', DEFAULT_ADMIN.email);
      console.log('   Name:', existingAdmin.name);
      console.log('   Role:', existingAdmin.role);
      console.log('   Created:', existingAdmin.createdAt);
      
      // Ask if user wants to reset password
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise((resolve) => {
        rl.question('Do you want to reset the admin password? (y/N): ', resolve);
      });
      rl.close();

      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, salt);
        
        // Update password
        await User.findByIdAndUpdate(existingAdmin._id, { 
          password: hashedPassword 
        });
        
        console.log('✅ Admin password has been reset');
        console.log('   Email:', DEFAULT_ADMIN.email);
        console.log('   Password:', DEFAULT_ADMIN.password);
      }
    } else {
      // Create new admin user
      const admin = new User(DEFAULT_ADMIN);
      await admin.save();
      
      console.log('✅ Admin user created successfully!');
      console.log('   Email:', DEFAULT_ADMIN.email);
      console.log('   Password:', DEFAULT_ADMIN.password);
      console.log('   Name:', DEFAULT_ADMIN.name);
    }

    console.log('================================');
    console.log('🎉 Admin setup completed!');
    console.log('');
    console.log('You can now login to the admin dashboard with:');
    console.log('   Email:', DEFAULT_ADMIN.email);
    console.log('   Password:', DEFAULT_ADMIN.password);
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
    process.exit(0);
  }
}

// Handle command line arguments for custom admin details
function parseArguments() {
  const args = process.argv.slice(2);
  const customAdmin = { ...DEFAULT_ADMIN };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];

    switch (key) {
      case '--email':
        customAdmin.email = value;
        break;
      case '--password':
        customAdmin.password = value;
        break;
      case '--name':
        customAdmin.name = value;
        break;
      case '--phone':
        customAdmin.phone = value;
        break;
      default:
        if (key.startsWith('--')) {
          console.log(`⚠️  Unknown argument: ${key}`);
        }
    }
  }

  return customAdmin;
}

// Show usage information
function showUsage() {
  console.log('Usage: npm run setup-admin [options]');
  console.log('');
  console.log('Options:');
  console.log('  --email <email>       Admin email (default: admin@freshharvest.com)');
  console.log('  --password <password> Admin password (default: admin123456)');
  console.log('  --name <name>         Admin name (default: System Administrator)');
  console.log('  --phone <phone>       Admin phone (default: +1234567890)');
  console.log('');
  console.log('Examples:');
  console.log('  npm run setup-admin');
  console.log('  npm run setup-admin -- --email admin@mystore.com --password mypassword');
}

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Parse custom arguments and setup admin
const customAdmin = parseArguments();
Object.assign(DEFAULT_ADMIN, customAdmin);

// Run the setup
setupAdmin();
