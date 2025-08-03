// smoke_sensor.js - Smoke Sensor
const mqtt = require('mqtt');
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

const sensorId = "smoke_sensor_001";
const topic = "/forest_fire/smoke_sensor";
let smokeLevel = 50; // Initial smoke level (0-100)

client.on('connect', () => {
    console.log(`[${sensorId}] Connected to MQTT broker`);
    
    setInterval(() => {
        // Simulate smoke level changes: normal 30-70, fire conditions up to 80-100
        const randomChange = (Math.random() - 0.5) * 20;
        smokeLevel += randomChange;
        
        // Limit smoke level range
        smokeLevel = Math.max(0, Math.min(100, smokeLevel));
        
        const message = {
            sensorId: sensorId,
            sensorType: "smoke",
            smokeLevel: Math.round(smokeLevel),
            timestamp: new Date().toISOString(),
            location: "forest_section_A"
        };
        
        client.publish(topic, JSON.stringify(message));
        console.log(`[${sensorId}] Published: Smoke Level ${message.smokeLevel}%`);
    }, 2000); // Send data every 2 seconds
});

client.on('error', (err) => {
    console.error(`[${sensorId}] MQTT Error:`, err);
}); 