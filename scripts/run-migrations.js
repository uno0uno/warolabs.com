#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * Executes all SQL migration files in the scripts/ directory
 * Uses the same connection system as the app (withPostgresClient)
 * 
 * Usage:
 *   node scripts/run-migrations.js
 *   npm run db:migrate-scripts
 */

const { readdir, readFile } = require('fs/promises');
const { join, dirname } = require('path');
const { Client } = require('pg');

// Get current directory
const scriptsDir = __dirname;

// Environment and database connection validation
const NODE_ENV = process.env.NODE_ENV;
const DATABASE_URL = process.env.DATABASE_URL;

// Prevent running migrations in production
if (NODE_ENV === 'production') {
  console.error('❌ Migrations cannot be run in production environment');
  console.error('💡 This script is only allowed in development/local environments');
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

console.log(`🌍 Environment: ${NODE_ENV || 'development'}`);
console.log('✅ Environment check passed - migrations allowed');

/**
 * Execute a single SQL migration file
 */
async function executeMigration(client, filePath, fileName) {
  try {
    console.log(`🔄 Executing migration: ${fileName}`);
    
    const sqlContent = await readFile(filePath, 'utf8');
    
    // Remove comments and empty lines for cleaner execution
    const cleanSql = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n');
    
    if (cleanSql.trim()) {
      await client.query(cleanSql);
      console.log(`✅ Migration completed: ${fileName}`);
    } else {
      console.log(`⚠️ Migration skipped (empty): ${fileName}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Migration failed: ${fileName}`);
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

/**
 * Main migration runner
 */
async function runMigrations() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Database connected');
    
    // Read all SQL files from scripts directory
    const files = await readdir(scriptsDir);
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure consistent execution order
    
    if (sqlFiles.length === 0) {
      console.log('ℹ️ No SQL migration files found in scripts/ directory');
      return;
    }
    
    console.log(`📄 Found ${sqlFiles.length} migration file(s):`);
    sqlFiles.forEach(file => console.log(`   - ${file}`));
    console.log('');
    
    // Execute migrations in order
    let successCount = 0;
    let failureCount = 0;
    
    for (const file of sqlFiles) {
      const filePath = join(scriptsDir, file);
      const success = await executeMigration(client, filePath, file);
      
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }
    
    // Summary
    console.log('');
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`   📄 Total: ${sqlFiles.length}`);
    
    if (failureCount > 0) {
      console.log('');
      console.log('⚠️ Some migrations failed. Please check the errors above.');
      process.exit(1);
    } else {
      console.log('');
      console.log('🎉 All migrations completed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Migration runner error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run migrations
runMigrations().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});