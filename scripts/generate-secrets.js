const crypto = require('crypto');

function generateSecureSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
}

function generateEncryptionKey() {
    return crypto.randomBytes(32).toString('base64');
}

console.log('\n=== Generated Security Values ===\n');
console.log(`SESSION_SECRET=${generateSecureSecret()}`);
console.log(`ENCRYPTION_KEY=${generateEncryptionKey()}`);
console.log('\n=== End of Generated Values ===\n');
console.log('Instructions:');
console.log('1. Copy these values to your .env.production file');
console.log('2. Keep these values secure and never commit them to version control');
console.log('3. Store backups of these values in a secure password manager');
console.log('4. If these values are ever compromised, generate new ones immediately\n'); 