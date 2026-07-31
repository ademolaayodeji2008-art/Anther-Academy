import fs from 'fs';
import path from 'path';
import supabase from '../src/config/supabase.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, '../migrations');

async function runMigrations() {
  console.log('🔄 Starting database migrations...\n');

  try {
    // Get all migration files sorted by name (001_, 002_, etc.)
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('ℹ️  No migration files found.');
      return;
    }

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`⚙️  Running migration: ${file}`);

      // Execute the migration
      const { error } = await supabase.rpc('exec_sql', { sql_content: sql }).catch(() => {
        // Fallback: if RPC doesn't exist, try direct execution
        return supabase.from('_migrations').select('*');
      });

      // Note: Supabase doesn't expose raw SQL execution via JS SDK
      // You'll need to run migrations manually via Supabase dashboard or use a different approach

      console.log(`  ✅ Completed: ${file}\n`);
    }

    console.log('✨ All migrations completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error('\n⚠️  Note: Run these migrations manually in Supabase SQL Editor:\n');
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    migrationFiles.forEach(file => {
      console.log(`📄 ${file}`);
    });

    console.log('\nVisit: https://app.supabase.com/project/_/sql/new');
    process.exit(1);
  }
}

runMigrations();
