const webPush = require('web-push');
const fs = require('fs');

// Generate VAPID keys
const vapidKeys = webPush.generateVAPIDKeys();

// Log the keys
console.log('Public VAPID Key:', vapidKeys.publicKey);
console.log('Private VAPID Key:', vapidKeys.privateKey);

// Save the keys to a .env file
const envContent = `
VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
`;

fs.writeFileSync('.env', envContent.trim(), { flag: 'w' });
console.log('.env file created with VAPID keys.');
