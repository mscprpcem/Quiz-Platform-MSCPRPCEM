const { Admin } = require('../models');
require('dotenv').config();

async function run() {
  const args = process.argv.slice(2);
  const email = (args[0] || '').trim().toLowerCase();
  const password = args[1];
  const name = args[2] || (email ? email.split('@')[0] : 'Administrator');

  if (!email || !password) {
    console.log('Usage: node src/scripts/createAdmin.js <email> <password> [name]');
    console.log('Example: node src/scripts/createAdmin.js admin2@mscprpcem.tech MyPass@123 "Aditi Sharma"\n');
    
    console.log('Existing Quiz Platform Admins:');
    const existing = await Admin.findAll();
    existing.forEach(a => console.log(` - ${a.name} (${a.email}) [ID: ${a.id}]`));
    process.exit(1);
  }

  try {
    let admin = await Admin.findOne({ where: { email } });
    if (admin) {
      admin.password = password;
      admin.name = name;
      await admin.save();
      console.log(`✅ Updated existing admin password & details: ${email}`);
    } else {
      admin = await Admin.create({
        name,
        email,
        password,
        role: 'admin'
      });
      console.log(`✅ Created new admin account successfully: ${email} (${name})`);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create/update admin:', err.message);
    process.exit(1);
  }
}

run();
