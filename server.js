require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const webPush = require('web-push');
const cors = require('cors');


const app = express();
app.use(bodyParser.json());
app.use(cors());

const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
};

// Validate the keys
if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    throw new Error('VAPID keys are not defined in the environment variables.');
  }

// Replace these with actual keys for production 
webPush.setVapidDetails(
  'mailto:shaykoo1993@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

console.log('Public VAPID Key:', vapidKeys.publicKey);

// In-memory store for subscriptions (replace this with a database in production)
let subscriptions = [];

//save the subscription object
app.post('/api/save-subscription', (req, res) => {
  const subscription = req.body;

  if (!subscriptions.some(sub => sub.endpoint === subscription.endpoint)) {
    subscriptions.push(subscription);
    console.log('Subscription saved:', subscription);
    res.status(201).json({ message: 'Subscription saved' });
  } else {
    res.status(200).json({ message: 'Subscription already exists' });
  }
});


app.post('/api/send-notification', (req, res) => {
    const notificationPayload = {
        title: 'Hardcoded Notification Title',
        body: 'This is a test notification sent from the server!',
        data: {
            url: 'https://example.com' 
        },
        icon: 'assets/icons/icon-192x192.png'
    };

    console.log("notificationPayload", notificationPayload);

    const promises = subscriptions.map(subscription => {
        return webPush.sendNotification(subscription, JSON.stringify(notificationPayload))
            .catch(err => {
                if (err.statusCode === 410) {
                    console.log('Subscription expired or unsubscribed:', subscription.endpoint);
                    subscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
                } else {
                    console.error('Error sending notification:', err);
                }
            });
    });

    Promise.all(promises)
        .then(() => res.status(200).json({ message: 'Notifications sent successfully' }))
        .catch(err => {
            console.error('Error sending notifications:', err);
            res.status(500).json({ error: 'Error sending notifications' });
        });
});


  
  
  // Route to handle sharing
    app.post('/api/share', (req, res) => {
        const { title, text, url } = req.body;
        
        console.log('Shared data received:', { title, text, url });
        res.status(200).json({ message: 'Shared data received successfully' });
    });
  

// Start
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
