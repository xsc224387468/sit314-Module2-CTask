// heat_sensor.js - Heat Sensor
const mqtt = require('mqtt');
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

const sensorId = "heat_sensor_001";
const topic = "/forest_fire/heat_sensor";
let temperature = 25; // Initial temperature 25°C

client.on('connect', () => {
    console.log(`[${sensorId}] Connected to MQTT broker`);
    
    setInterval(() => {
        // Simulate temperature changes: normal 25-35°C, fire conditions up to 60-80°C
        const randomChange = (Math.random() - 0.5) * 10;
        temperature += randomChange;
        
        // Limit temperature range
        temperature = Math.max(20, Math.min(80, temperature));
        
        const message = {
            sensorId: sensorId,
            sensorType: "heat",
            temperature: Math.round(temperature * 10) / 10,
            timestamp: new Date().toISOString(),
            location: "forest_section_A"
        };
        
        client.publish(topic, JSON.stringify(message));
        console.log(`[${sensorId}] Published: Temperature ${message.temperature}°C`);
    }, 2000); // Send data every 2 seconds
});

client.on('error', (err) => {
    console.error(`[${sensorId}] MQTT Error:`, err);
}); 