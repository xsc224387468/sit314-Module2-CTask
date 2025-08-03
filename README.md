# Forest Fire Monitoring and Alarm System

## Project Overview

This is an advanced forest fire monitoring and alarm system prototype built using Node.js, MQTT, and Node-RED. The system uses multiple sensors to detect heat, smoke, fire, and wind conditions in a forest environment and sends intelligent alerts to different groups based on comprehensive risk assessment.

## Installation and Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Quick Start (Windows)
```bash
start_system.bat
```

### 3. Manual Startup
```bash
# Start individual sensors
node sensors/heat_sensor.js
node sensors/smoke_sensor.js
node sensors/fire_sensor.js
node sensors/wind_sensor.js

# Start alarm system
node alarm_system.js

# Start monitoring dashboard
node monitor_dashboard.js
```

### 4. Start Node-RED
```bash
npx node-red
```
Then open `http://127.0.0.1:1880/` in your browser

## Alert Rules

### Risk Assessment Algorithm
```
Risk Score = Temperature Risk + Smoke Risk + Fire Risk + Wind Risk

Temperature Risk:
- > 60°C: +3 points
- > 45°C: +2 points  
- > 35°C: +1 point

Smoke Risk:
- > 80%: +3 points
- > 60%: +2 points
- > 40%: +1 point

Fire Risk:
- Fire intensity > 70%: +4 points
- Fire intensity > 40%: +3 points
- Fire detected: +2 points

Wind Risk:
- > 25 km/h: +2 points
- > 15 km/h: +1 point
```

### Alert Levels
- **WARNING (2-3 points)**: Notify local homeowners
- **ALERT (4-5 points)**: Notify fire service
- **EMERGENCY (6-7 points)**: Notify news organizations
- **CRITICAL (8+ points)**: Broadcast on social media

## MQTT Topic Structure

```
/forest_fire/heat_sensor      # Heat sensor data
/forest_fire/smoke_sensor     # Smoke sensor data
/forest_fire/fire_sensor      # Fire sensor data
/forest_fire/wind_sensor      # Wind sensor data
/forest_fire/alerts/homeowners    # Homeowner alerts
/forest_fire/alerts/fire_service  # Fire service alerts
/forest_fire/alerts/news          # News organization alerts
/forest_fire/alerts/social_media  # Social media alerts
```

## Node-RED Configuration

1. Import the `node-red-flow.json` file
2. Configure MQTT broker connection to `broker.hivemq.com:1883`
3. Deploy the flow

## Monitoring Dashboard

Run `node monitor_dashboard.js` to view the real-time monitoring interface, including:
- All sensor real-time data
- Risk assessment and scoring
- Recent alert history
- System status

## Technical Features

1. **Distributed Architecture**: Uses MQTT to decouple sensors from processing systems
2. **Intelligent Decision Making**: Comprehensive risk assessment based on multi-sensor data
3. **Real-time Monitoring**: All data updates and displays in real-time
4. **Scalability**: Easy to add new sensors and alert rules
5. **Visualization**: Node-RED provides graphical flow design

## Core Code Examples

### Heat Sensor Simulation
```javascript
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
```

### Risk Assessment Algorithm
```javascript
function analyzeFireRisk() {
    // Check if we have enough data for analysis
    if (!sensorData.heat || !sensorData.smoke || !sensorData.fire || !sensorData.wind) {
        return ALERT_LEVELS.NONE;
    }
    
    let riskScore = 0;
    
    // Temperature risk assessment
    if (sensorData.heat.temperature > 60) riskScore += 3;
    else if (sensorData.heat.temperature > 45) riskScore += 2;
    else if (sensorData.heat.temperature > 35) riskScore += 1;
    
    // Smoke risk assessment
    if (sensorData.smoke.smokeLevel > 80) riskScore += 3;
    else if (sensorData.smoke.smokeLevel > 60) riskScore += 2;
    else if (sensorData.smoke.smokeLevel > 40) riskScore += 1;
    
    // Fire detection
    if (sensorData.fire.fireDetected) {
        if (sensorData.fire.fireIntensity > 70) riskScore += 4;
        else if (sensorData.fire.fireIntensity > 40) riskScore += 3;
        else riskScore += 2;
    }
    
    // Wind speed risk assessment (strong winds accelerate fire spread)
    if (sensorData.wind.windSpeed > 25) riskScore += 2;
    else if (sensorData.wind.windSpeed > 15) riskScore += 1;
    
    // Determine alert level based on risk score
    if (riskScore >= 8) return ALERT_LEVELS.CRITICAL;
    if (riskScore >= 6) return ALERT_LEVELS.EMERGENCY;
    if (riskScore >= 4) return ALERT_LEVELS.ALERT;
    if (riskScore >= 2) return ALERT_LEVELS.WARNING;
    
    return ALERT_LEVELS.NONE;
}
```


## License

This project is created for academic purposes as part of SIT314 Module 2 Credit Task.

## Author
Shicheng Xiang
