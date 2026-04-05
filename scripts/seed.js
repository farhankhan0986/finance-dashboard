require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key. Please check your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  try {
    console.log('Seeding database...');
    const adminPass = await bcrypt.hash('Admin@123', 10);
    const analystPass = await bcrypt.hash('Analyst@123', 10);
    const viewerPass = await bcrypt.hash('Viewer@123', 10);

    // Using upsert instead of ON CONFLICT DO NOTHING to ensure we get IDs back easily or ignore.
    const usersToInsert = [
      { name: 'Admin User', email: 'admin@demo.com', password_hash: adminPass, role: 'admin', status: 'active' },
      { name: 'Analyst User', email: 'analyst@demo.com', password_hash: analystPass, role: 'analyst', status: 'active' },
      { name: 'Viewer User', email: 'viewer@demo.com', password_hash: viewerPass, role: 'viewer', status: 'active' }
    ];

    console.log('Inserting users...');
    
    // We do this individually, or check if they exist first, to avoid failing when email already exists
    // Simple approach: try inserted. If error code 23505 (unique violation), we can select them.
    let users = [];
    const { data: existingUsers } = await supabase.from('users').select('*');
    
    if (existingUsers && existingUsers.length > 0) {
       console.log('Users already exist in database. Fetched existing users.');
       users = existingUsers;
    } else {
       const { data: insertedUsers, error: userErr } = await supabase
        .from('users')
        .insert(usersToInsert)
        .select('id, role');
        
       if (userErr) throw userErr;
       users = insertedUsers;
    }

    console.log('Users seeded/fetched.');

    if (users && users.length > 0) {
      const adminUserId = users.find(u => u.role === 'admin').id;
      
      console.log('Checking for existing records...');
      const { data: existingRecords } = await supabase.from('records').select('id').limit(1);

      if (existingRecords && existingRecords.length > 0) {
        console.log('Records already exist, skipping record seeding.');
      } else {
        // Calculate dates locally
        const today = new Date();
        const daysAgo = (days) => { const d = new Date(); d.setDate(today.getDate() - days); return d.toISOString(); };

        const recordsToInsert = [
          { amount: 5000.00, type: 'income', category: 'Salary', record_date: daysAgo(15), notes: 'Monthly Salary', created_by: adminUserId },
          { amount: 120.50, type: 'expense', category: 'Food', record_date: daysAgo(14), notes: 'Groceries', created_by: adminUserId },
          { amount: 45.00, type: 'expense', category: 'Transport', record_date: daysAgo(12), notes: 'Gas', created_by: adminUserId },
          { amount: 2000.00, type: 'income', category: 'Freelance', record_date: daysAgo(10), notes: 'Project A', created_by: adminUserId },
          { amount: 600.00, type: 'expense', category: 'Utilities', record_date: daysAgo(5), notes: 'Electric Bill', created_by: adminUserId },
          { amount: 50.00, type: 'expense', category: 'Entertainment', record_date: daysAgo(2), notes: 'Movie', created_by: adminUserId }
        ];

        console.log('Inserting records...');
        const { error: recErr } = await supabase.from('records').insert(recordsToInsert);
        if (recErr) throw recErr;
        
        console.log('Sample records seeded.');
      }
    } else {
      console.log('Could not determine Admin User ID.');
    }
    
    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

seed();
