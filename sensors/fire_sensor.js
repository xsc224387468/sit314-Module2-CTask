// fire_sensor.js - Fire Sensor
const mqtt = require('mqtt');
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

const sensorId = "fire_sensor_001";
const topic = "/forest_fire/fire_sensor";
let fireDetected = false;
let fireIntensity = 0; // Fire intensity (0-100)

client.on('connect', () => {
    console.log(`[${sensorId}] Connected to MQTT broker`);
    
    setInterval(() => {
        // Simulate fire detection: mostly no fire, occasionally detect fire
        if (Math.random() < 0.1) { // 10% probability of detecting fire
            fireDetected = true;
            fireIntensity = Math.random() * 100;
        } else {
            fireDetected = false;
            fireIntensity = 0;
        }
        
        const message = {
            sensorId: sensorId,
            sensorType: "fire",
            fireDetected: fireDetected,
            fireIntensity: Math.round(fireIntensity),
            timestamp: new Date().toISOString(),
            location: "forest_section_A"
        };
        
        client.publish(topic, JSON.stringify(message));
        console.log(`[${sensorId}] Published: Fire ${fireDetected ? 'DETECTED' : 'Not Detected'} (Intensity: ${message.fireIntensity}%)`);
    }, 3000); // Send data every 3 seconds
});

client.on('error', (err) => {
    console.error(`[${sensorId}] MQTT Error:`, err);
}); 