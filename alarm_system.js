// alarm_system.js - Intelligent Forest Fire Alarm System
const mqtt = require('mqtt');
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Store latest sensor data
let sensorData = {
    heat: null,
    smoke: null,
    fire: null,
    wind: null
};

// Alert level definitions
const ALERT_LEVELS = {
    NONE: 0,
    WARNING: 1,      // Local homeowners
    ALERT: 2,        // Fire service
    EMERGENCY: 3,    // News organizations
    CRITICAL: 4      // Social media
};

client.on('connect', () => {
    console.log('[Alarm System] Connected to MQTT broker');
    
    // Subscribe to all sensor topics
    client.subscribe('/forest_fire/heat_sensor');
    client.subscribe('/forest_fire/smoke_sensor');
    client.subscribe('/forest_fire/fire_sensor');
    client.subscribe('/forest_fire/wind_sensor');
});

client.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        
        // Update sensor data
        switch(data.sensorType) {
            case 'heat':
                sensorData.heat = data;
                break;
            case 'smoke':
                sensorData.smoke = data;
                break;
            case 'fire':
                sensorData.fire = data;
                break;
            case 'wind':
                sensorData.wind = data;
                break;
        }
        
        // Analyze data and determine alert level
        const alertLevel = analyzeFireRisk();
        
        if (alertLevel > ALERT_LEVELS.NONE) {
            sendAlert(alertLevel, data);
        }
        
    } catch (error) {
        console.error('[Alarm System] Error parsing message:', error);
    }
});

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

function sendAlert(level, triggerData) {
    const alertMessage = {
        level: level,
        timestamp: new Date().toISOString(),
        location: triggerData.location,
        sensorData: sensorData,
        message: getAlertMessage(level)
    };
    
    // Send to different topics based on alert level
    switch(level) {
        case ALERT_LEVELS.WARNING:
            client.publish('/forest_fire/alerts/homeowners', JSON.stringify(alertMessage));
            console.log('🚨 WARNING ALERT: Notifying local homeowners');
            break;
            
        case ALERT_LEVELS.ALERT:
            client.publish('/forest_fire/alerts/fire_service', JSON.stringify(alertMessage));
            console.log('🚨 ALERT: Notifying fire service');
            break;
            
        case ALERT_LEVELS.EMERGENCY:
            client.publish('/forest_fire/alerts/news', JSON.stringify(alertMessage));
            console.log('🚨 EMERGENCY: Notifying news organizations');
            break;
            
        case ALERT_LEVELS.CRITICAL:
            client.publish('/forest_fire/alerts/social_media', JSON.stringify(alertMessage));
            console.log('🚨 CRITICAL: Broadcasting on social media');
            break;
    }
}

function getAlertMessage(level) {
    switch(level) {
        case ALERT_LEVELS.WARNING:
            return "Forest fire risk detected. Please be prepared for evacuation.";
        case ALERT_LEVELS.ALERT:
            return "Forest fire confirmed. Fire service has been notified.";
        case ALERT_LEVELS.EMERGENCY:
            return "EMERGENCY: Large forest fire detected. Immediate evacuation required.";
        case ALERT_LEVELS.CRITICAL:
            return "CRITICAL: Massive forest fire spreading rapidly. Evacuate immediately!";
        default:
            return "Forest fire monitoring system active.";
    }
}

client.on('error', (err) => {
    console.error('[Alarm System] MQTT Error:', err);
}); 