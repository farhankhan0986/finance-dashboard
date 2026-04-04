require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  try {
    console.log('Seeding database...');
    const adminPass = await bcrypt.hash('Admin@123', 10);
    const analystPass = await bcrypt.hash('Analyst@123', 10);
    const viewerPass = await bcrypt.hash('Viewer@123', 10);

    const { rows: users } = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES 
        ('Admin User', 'admin@demo.com', $1, 'admin', 'active'),
        ('Analyst User', 'analyst@demo.com', $2, 'analyst', 'active'),
        ('Viewer User', 'viewer@demo.com', $3, 'viewer', 'active')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, role;
    `, [adminPass, analystPass, viewerPass]);

    console.log('Users seeded.');

    if (users.length > 0) {
      const adminId = users.find(u => u.role === 'admin').id;
      
      await pool.query(`
        INSERT INTO records (amount, type, category, record_date, notes, created_by)
        VALUES 
          (5000.00, 'income', 'Salary', CURRENT_DATE - INTERVAL '15 days', 'Monthly Salary', $1),
          (120.50, 'expense', 'Food', CURRENT_DATE - INTERVAL '14 days', 'Groceries', $1),
          (45.00, 'expense', 'Transport', CURRENT_DATE - INTERVAL '12 days', 'Gas', $1),
          (2000.00, 'income', 'Freelance', CURRENT_DATE - INTERVAL '10 days', 'Project A', $1),
          (600.00, 'expense', 'Utilities', CURRENT_DATE - INTERVAL '5 days', 'Electric Bill', $1),
          (50.00, 'expense', 'Entertainment', CURRENT_DATE - INTERVAL '2 days', 'Movie', $1)
      `, [adminId]);
      
      console.log('Sample records seeded.');
    } else {
      console.log('Users already exist, skipping record seeding. Or database error.');
    }
    
    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await pool.end();
  }
}

seed();
