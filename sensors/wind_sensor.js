// wind_sensor.js - Wind Sensor
const mqtt = require('mqtt');
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

const sensorId = "wind_sensor_001";
const topic = "/forest_fire/wind_sensor";
let windSpeed = 5; // Initial wind speed (km/h)

client.on('connect', () => {
    console.log(`[${sensorId}] Connected to MQTT broker`);
    
    setInterval(() => {
        // Simulate wind speed changes: normal 2-15 km/h, strong winds up to 30+ km/h
        const randomChange = (Math.random() - 0.5) * 8;
        windSpeed += randomChange;
        
        // Limit wind speed range
        windSpeed = Math.max(0, Math.min(50, windSpeed));
        
        const message = {
            sensorId: sensorId,
            sensorType: "wind",
            windSpeed: Math.round(windSpeed * 10) / 10,
            timestamp: new Date().toISOString(),
            location: "forest_section_A"
        };
        
        client.publish(topic, JSON.stringify(message));
        console.log(`[${sensorId}] Published: Wind Speed ${message.windSpeed} km/h`);
    }, 2500); // Send data every 2.5 seconds
});

client.on('error', (err) => {
    console.error(`[${sensorId}] MQTT Error:`, err);
}); 