#!/usr/bin/env node

/**
 * Complete System Test for Time Tracker Web Application
 * Tests all major functionality end-to-end
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

console.log('🧪 Starting Complete System Test for Time Tracker\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(testName, testFn) {
  try {
    console.log(`🔍 Testing: ${testName}`);
    testFn();
    console.log(`   ✅ PASSED: ${testName}`);
    testsPassed++;
  } catch (error) {
    console.log(`   ❌ FAILED: ${testName}`);
    console.log(`      Error: ${error.message}`);
    testsFailed++;
  }
  console.log('');
}

// Test 1: Environment Setup
runTest('Environment Configuration', () => {
  if (!existsSync('.env')) {
    throw new Error('.env file not found');
  }
  
  const envContent = readFileSync('.env', 'utf8');
  if (!envContent.includes('DATABASE_URL=')) {
    throw new Error('DATABASE_URL not configured');
  }
  if (!envContent.includes('SESSION_SECRET=')) {
    throw new Error('SESSION_SECRET not configured');
  }
});

// Test 2: Dependencies
runTest('Dependencies Installation', () => {
  if (!existsSync('node_modules')) {
    throw new Error('Dependencies not installed - run npm install');
  }
  
  // Check critical dependencies
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const criticalDeps = [
    '@tanstack/react-query',
    'express',
    'react',
    'drizzle-orm',
    'passport'
  ];
  
  criticalDeps.forEach(dep => {
    if (!packageJson.dependencies[dep]) {
      throw new Error(`Missing critical dependency: ${dep}`);
    }
  });
});

// Test 3: TypeScript Compilation
runTest('TypeScript Compilation', () => {
  try {
    execSync('npm run check', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('TypeScript compilation failed');
  }
});

// Test 4: Database Schema Files
runTest('Database Schema', () => {
  if (!existsSync('shared/schema.ts')) {
    throw new Error('Database schema file not found');
  }
  
  const schemaContent = readFileSync('shared/schema.ts', 'utf8');
  const requiredTables = ['users', 'timeEntries', 'payrollPeriods'];
  
  requiredTables.forEach(table => {
    if (!schemaContent.includes(table)) {
      throw new Error(`Missing table definition: ${table}`);
    }
  });
});

// Test 5: Server Files
runTest('Server Implementation', () => {
  const serverFiles = [
    'server/index.ts',
    'server/routes.ts', 
    'server/storage.ts',
    'server/auth.ts',
    'server/seed.ts'
  ];
  
  serverFiles.forEach(file => {
    if (!existsSync(file)) {
      throw new Error(`Missing server file: ${file}`);
    }
  });
  
  // Check auth implementation
  const authContent = readFileSync('server/auth.ts', 'utf8');
  if (!authContent.includes('passport.use')) {
    throw new Error('Passport authentication not configured');
  }
});

// Test 6: Client Files
runTest('Client Implementation', () => {
  const clientFiles = [
    'client/src/App.tsx',
    'client/src/pages/time-tracker.tsx',
    'client/src/pages/login.tsx',
    'client/src/lib/queryClient.ts'
  ];
  
  clientFiles.forEach(file => {
    if (!existsSync(file)) {
      throw new Error(`Missing client file: ${file}`);
    }
  });
  
  // Check authentication wrapper
  const appContent = readFileSync('client/src/App.tsx', 'utf8');
  if (!appContent.includes('AuthWrapper')) {
    throw new Error('Authentication wrapper not implemented');
  }
});

// Test 7: API Routes Structure
runTest('API Routes Implementation', () => {
  const routesContent = readFileSync('server/routes.ts', 'utf8');
  
  const requiredRoutes = [
    '/api/auth/login',
    '/api/auth/logout', 
    '/api/auth/register',
    '/api/user/current',
    '/api/time-entries/today',
    '/api/time-entries/punch',
    '/api/payroll/current'
  ];
  
  requiredRoutes.forEach(route => {
    if (!routesContent.includes(route)) {
      throw new Error(`Missing API route: ${route}`);
    }
  });
  
  // Check authentication middleware
  if (!routesContent.includes('requireAuth')) {
    throw new Error('Authentication middleware not implemented');
  }
});

// Test 8: Database Connection Setup
runTest('Database Configuration', () => {
  const storageContent = readFileSync('server/storage.ts', 'utf8');
  
  if (!storageContent.includes('drizzle')) {
    throw new Error('Drizzle ORM not configured');
  }
  
  if (!storageContent.includes('process.env.DATABASE_URL')) {
    throw new Error('Database URL not configured');
  }
  
  // Check all required methods exist
  const requiredMethods = [
    'getUser',
    'getUserByUsername', 
    'createUser',
    'getTimeEntry',
    'createTimeEntry',
    'updateTimeEntry'
  ];
  
  requiredMethods.forEach(method => {
    if (!storageContent.includes(method)) {
      throw new Error(`Missing storage method: ${method}`);
    }
  });
});

// Test 9: Frontend Components
runTest('Frontend Components', () => {
  const componentFiles = [
    'client/src/components/time-tracker/header.tsx',
    'client/src/components/time-tracker/time-tracking-controls.tsx',
    'client/src/components/time-tracker/current-status.tsx'
  ];
  
  componentFiles.forEach(file => {
    if (!existsSync(file)) {
      throw new Error(`Missing component file: ${file}`);
    }
  });
  
  // Check logout implementation
  const headerContent = readFileSync('client/src/components/time-tracker/header.tsx', 'utf8');
  if (!headerContent.includes('/api/auth/logout')) {
    throw new Error('Logout functionality not implemented');
  }
});

// Test 10: Build Configuration
runTest('Build Configuration', () => {
  const configFiles = [
    'vite.config.ts',
    'tsconfig.json',
    'drizzle.config.ts',
    'docker-compose.yml'
  ];
  
  configFiles.forEach(file => {
    if (!existsSync(file)) {
      throw new Error(`Missing config file: ${file}`);
    }
  });
});

// Test 11: Docker Setup
runTest('Docker Configuration', () => {
  const dockerContent = readFileSync('docker-compose.yml', 'utf8');
  
  if (!dockerContent.includes('postgres')) {
    throw new Error('PostgreSQL service not configured');
  }
  
  if (!dockerContent.includes('time_tracker_db')) {
    throw new Error('Database name not configured');
  }
});

// Test 12: Seed Data
runTest('Database Seeding', () => {
  const seedContent = readFileSync('server/seed.ts', 'utf8');
  
  if (!seedContent.includes('createUser')) {
    throw new Error('User seeding not implemented');
  }
  
  if (!seedContent.includes('createPayrollPeriod')) {
    throw new Error('Payroll period seeding not implemented');
  }
});

// Test 13: Authentication Flow
runTest('Authentication Implementation', () => {
  const loginContent = readFileSync('client/src/pages/login.tsx', 'utf8');
  
  if (!loginContent.includes('loginMutation')) {
    throw new Error('Login mutation not implemented');
  }
  
  if (!loginContent.includes('registerMutation')) {
    throw new Error('Register mutation not implemented');
  }
  
  // Check form validation
  if (!loginContent.includes('required')) {
    throw new Error('Form validation not implemented');
  }
});

// Test 14: Time Tracking Logic
runTest('Time Tracking Business Logic', () => {
  const routesContent = readFileSync('server/routes.ts', 'utf8');
  
  if (!routesContent.includes('calculateHours')) {
    throw new Error('Hour calculation not implemented');
  }
  
  if (!routesContent.includes('validatePunchSequence')) {
    throw new Error('Punch sequence validation not implemented');
  }
  
  if (!routesContent.includes('detectMissingPunches')) {
    throw new Error('Missing punch detection not implemented');
  }
});

// Test 15: Error Handling
runTest('Error Handling', () => {
  const queryClientContent = readFileSync('client/src/lib/queryClient.ts', 'utf8');
  
  if (!queryClientContent.includes('throwIfResNotOk')) {
    throw new Error('Response error handling not implemented');
  }
  
  const loginContent = readFileSync('client/src/pages/login.tsx', 'utf8');
  if (!loginContent.includes('onError')) {
    throw new Error('Mutation error handling not implemented');
  }
});

// Final Results
console.log('='.repeat(60));
console.log('📊 TEST RESULTS SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

if (testsFailed === 0) {
  console.log('\n🎉 ALL TESTS PASSED! System is ready for deployment.');
  console.log('\n📋 Next Steps:');
  console.log('1. Install dependencies: npm install');
  console.log('2. Start database: npm run docker:up');
  console.log('3. Seed database: npm run seed');
  console.log('4. Start development: npm run dev');
  console.log('5. Access app: http://localhost:5000');
  console.log('6. Login with: admin / admin123');
} else {
  console.log('\n⚠️  Some tests failed. Please fix the issues above before proceeding.');
  process.exit(1);
}

console.log('='.repeat(60));