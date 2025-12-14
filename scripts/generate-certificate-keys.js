#!/usr/bin/env node

/**
 * Generate RSA key pair for certificate signing
 * Run with: node scripts/generate-certificate-keys.js
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

console.log('🔐 Generating RSA key pair for certificate signing...');

try {
  // Generate RSA key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  console.log('✅ Key pair generated successfully!');
  
  // Display keys (for .env file)
  console.log('\n' + '='.repeat(60));
  console.log('🔑 COPY THESE VALUES TO YOUR .env FILE:');
  console.log('='.repeat(60));
  
  // Convert to base64 for easier storage in .env
  const privateKeyBase64 = Buffer.from(privateKey).toString('base64');
  const publicKeyBase64 = Buffer.from(publicKey).toString('base64');
  
  console.log('CERTIFICATE_PRIVATE_KEY=' + privateKeyBase64);
  console.log('CERTIFICATE_PUBLIC_KEY=' + publicKeyBase64);
  
  console.log('='.repeat(60));
  
  // Save to files for backup
  const keysDir = path.join(process.cwd(), 'keys');
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(keysDir, 'certificate-private.pem'), privateKey);
  fs.writeFileSync(path.join(keysDir, 'certificate-public.pem'), publicKey);
  
  // Create .gitignore for keys directory
  fs.writeFileSync(path.join(keysDir, '.gitignore'), '*\n!.gitignore\n');
  
  console.log('💾 Keys also saved to keys/ directory (git ignored)');
  console.log('⚠️  IMPORTANT: Keep your private key secure and never commit it!');
  
} catch (error) {
  console.error('❌ Failed to generate keys:', error);
  process.exit(1);
}