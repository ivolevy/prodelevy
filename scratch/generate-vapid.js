const webpush = require('web-push');

console.log("Generating VAPID public and private keys...");
const vapidKeys = webpush.generateVAPIDKeys();

console.log("\n==================================================");
console.log("Add the following to your .env.local file:");
console.log("==================================================");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
console.log("==================================================\n");
