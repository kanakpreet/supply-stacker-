#!/usr/bin/env node

/**
 * Verification script for Time Tracker Web Application
 * This script checks if the setup is working correctly
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Verifying Time Tracker Web Application setup...\n');

let allChecksPassed = true;

// Check 1: Node.js version
console.log('1. Checking Node.js version...');
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion >= 18) {
        console.log(`   ✅ Node.js ${nodeVersion} (meets requirement >= 18)`);
    } else {
        console.log(`   ❌ Node.js ${nodeVersion} (requires >= 18)`);
        allChecksPassed = false;
    }
} catch (error) {
    console.log('   ❌ Node.js not found');
    allChecksPassed = false;
}

// Check 2: Package.json exists
console.log('\n2. Checking package.json...');
const packageJsonPath = join(__dirname, 'package.json');
if (existsSync(packageJsonPath)) {
    console.log('   ✅ package.json exists');
} else {
    console.log('   ❌ package.json not found');
    allChecksPassed = false;
}

// Check 3: Dependencies installed
console.log('\n3. Checking dependencies...');
const nodeModulesPath = join(__dirname, 'node_modules');
if (existsSync(nodeModulesPath)) {
    console.log('   ✅ node_modules exists');
} else {
    console.log('   ❌ node_modules not found (run: npm install)');
    allChecksPassed = false;
}

// Check 4: Environment file
console.log('\n4. Checking environment configuration...');
const envPath = join(__dirname, '.env');
const envExamplePath = join(__dirname, '.env.example');

if (existsSync(envPath)) {
    console.log('   ✅ .env file exists');
    
    // Check if DATABASE_URL is set
    try {
        const envContent = readFileSync(envPath, 'utf8');
        if (envContent.includes('DATABASE_URL=')) {
            console.log('   ✅ DATABASE_URL is configured');
        } else {
            console.log('   ⚠️  DATABASE_URL not found in .env');
        }
    } catch (error) {
        console.log('   ⚠️  Could not read .env file');
    }
} else if (existsSync(envExamplePath)) {
    console.log('   ⚠️  .env file not found, but .env.example exists');
    console.log('   💡 Run: cp .env.example .env');
} else {
    console.log('   ❌ No environment configuration found');
    allChecksPassed = false;
}

// Check 5: Docker availability
console.log('\n5. Checking Docker availability...');
try {
    execSync('docker --version', { stdio: 'ignore' });
    console.log('   ✅ Docker is available');
    
    try {
        execSync('docker-compose --version', { stdio: 'ignore' });
        console.log('   ✅ Docker Compose is available');
    } catch (error) {
        console.log('   ⚠️  Docker Compose not found');
    }
} catch (error) {
    console.log('   ⚠️  Docker not available (manual PostgreSQL setup required)');
}

// Check 6: Database connection (if .env exists)
console.log('\n6. Checking database connection...');
if (existsSync(envPath)) {
    try {
        // Load environment variables
        const envContent = readFileSync(envPath, 'utf8');
        const envVars = {};
        
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                envVars[key.trim()] = valueParts.join('=').trim();
            }
        });
        
        if (envVars.DATABASE_URL) {
            console.log('   ✅ DATABASE_URL is configured');
            
            // Try to connect to database
            try {
                // This is a basic check - in a real scenario you'd use a proper database client
                console.log('   ⚠️  Database connection test skipped (requires running database)');
                console.log('   💡 Start database with: npm run docker:up');
            } catch (error) {
                console.log('   ❌ Could not connect to database');
                console.log('   💡 Ensure database is running and DATABASE_URL is correct');
            }
        } else {
            console.log('   ❌ DATABASE_URL not configured');
            allChecksPassed = false;
        }
    } catch (error) {
        console.log('   ⚠️  Could not read environment variables');
    }
} else {
    console.log('   ⚠️  Skipped (no .env file)');
}

// Check 7: TypeScript configuration
console.log('\n7. Checking TypeScript configuration...');
const tsConfigPath = join(__dirname, 'tsconfig.json');
if (existsSync(tsConfigPath)) {
    console.log('   ✅ tsconfig.json exists');
} else {
    console.log('   ❌ tsconfig.json not found');
    allChecksPassed = false;
}

// Check 8: Vite configuration
console.log('\n8. Checking Vite configuration...');
const viteConfigPath = join(__dirname, 'vite.config.ts');
if (existsSync(viteConfigPath)) {
    console.log('   ✅ vite.config.ts exists');
} else {
    console.log('   ❌ vite.config.ts not found');
    allChecksPassed = false;
}

// Check 9: Drizzle configuration
console.log('\n9. Checking Drizzle configuration...');
const drizzleConfigPath = join(__dirname, 'drizzle.config.ts');
if (existsSync(drizzleConfigPath)) {
    console.log('   ✅ drizzle.config.ts exists');
} else {
    console.log('   ❌ drizzle.config.ts not found');
    allChecksPassed = false;
}

// Check 10: Docker Compose file
console.log('\n10. Checking Docker Compose configuration...');
const dockerComposePath = join(__dirname, 'docker-compose.yml');
if (existsSync(dockerComposePath)) {
    console.log('   ✅ docker-compose.yml exists');
} else {
    console.log('   ❌ docker-compose.yml not found');
    allChecksPassed = false;
}

// Final summary
console.log('\n' + '='.repeat(50));
if (allChecksPassed) {
    console.log('🎉 All checks passed! Your setup looks good.');
    console.log('\nNext steps:');
    console.log('1. Start the database: npm run docker:up');
    console.log('2. Start the development server: npm run dev');
    console.log('3. Open http://localhost:5000 in your browser');
} else {
    console.log('⚠️  Some checks failed. Please review the issues above.');
    console.log('\nCommon fixes:');
    console.log('- Run: npm install');
    console.log('- Copy: cp .env.example .env');
    console.log('- Start database: npm run docker:up');
}
console.log('='.repeat(50)); 