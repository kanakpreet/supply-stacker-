#!/usr/bin/env node

/**
 * Fix for PostgreSQL import issues in different Node.js environments
 * This script helps resolve ESM/CommonJS compatibility issues with the 'pg' package
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔧 Fixing PostgreSQL import compatibility issues...\n');

// Check Node.js version
const nodeVersion = process.version;
console.log(`Node.js version: ${nodeVersion}`);

// Check if pg package is installed
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  if (!packageJson.dependencies?.pg && !packageJson.devDependencies?.pg) {
    console.log('📦 Installing pg package...');
    execSync('npm install pg @types/pg', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('❌ Error checking package.json:', error.message);
}

// Test different import methods
console.log('\n🧪 Testing import methods...\n');

const testImports = async () => {
  let workingMethod = null;
  
  // Test Method 1: ESM import
  try {
    console.log('1. Testing ESM import...');
    const pgModule = await import('pg');
    const Pool = pgModule.default?.Pool || pgModule.Pool;
    if (Pool) {
      console.log('   ✅ ESM import works');
      workingMethod = 'esm';
    } else {
      console.log('   ❌ ESM import failed - Pool not found');
    }
  } catch (error) {
    console.log('   ❌ ESM import failed:', error.message);
  }
  
  // Test Method 2: Dynamic require
  if (!workingMethod) {
    try {
      console.log('2. Testing dynamic require...');
      const pgModule = require('pg');
      const Pool = pgModule.Pool;
      if (Pool) {
        console.log('   ✅ Dynamic require works');
        workingMethod = 'require';
      } else {
        console.log('   ❌ Dynamic require failed - Pool not found');
      }
    } catch (error) {
      console.log('   ❌ Dynamic require failed:', error.message);
    }
  }
  
  return workingMethod;
};

// Create a compatibility wrapper
const createCompatibilityWrapper = (method) => {
  const wrapperCode = `
// Auto-generated PostgreSQL compatibility wrapper
// Generated on: ${new Date().toISOString()}
// Working method: ${method}

let Pool, drizzle;

export async function initializePg() {
  try {
    ${method === 'esm' ? `
    // ESM import method
    const pgModule = await import('pg');
    Pool = pgModule.default?.Pool || pgModule.Pool;
    
    const drizzleModule = await import('drizzle-orm/node-postgres');
    drizzle = drizzleModule.drizzle;
    ` : `
    // CommonJS require method
    const pgModule = require('pg');
    Pool = pgModule.Pool;
    
    const drizzleModule = require('drizzle-orm/node-postgres');
    drizzle = drizzleModule.drizzle;
    `}
    
    if (!Pool || !drizzle) {
      throw new Error('Failed to import required modules');
    }
    
    return { Pool, drizzle };
  } catch (error) {
    console.error('Database import failed:', error.message);
    return null;
  }
}
`;
  
  writeFileSync('server/pg-compat.js', wrapperCode);
  console.log('📝 Created compatibility wrapper: server/pg-compat.js');
};

// Main execution
(async () => {
  try {
    const workingMethod = await testImports();
    
    if (workingMethod) {
      console.log(`\n✅ Found working import method: ${workingMethod}`);
      createCompatibilityWrapper(workingMethod);
      
      console.log('\n🎉 Fix applied successfully!');
      console.log('\n📋 Next steps for your friend:');
      console.log('1. Run: npm install');
      console.log('2. Run: node fix-pg-import.js');
      console.log('3. Start the server: npm run dev');
      
    } else {
      console.log('\n⚠️  No working import method found.');
      console.log('\n🔧 Alternative solutions:');
      console.log('1. Use mock storage (already configured as fallback)');
      console.log('2. Try different Node.js version (18.x or 20.x recommended)');
      console.log('3. Clear node_modules and reinstall: npm run reset');
    }
    
  } catch (error) {
    console.error('❌ Error during fix process:', error.message);
  }
})();