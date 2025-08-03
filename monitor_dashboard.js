// monitor_dashboard.js - Forest Fire Monitoring Dashboard
const mqtt = require('mqtt');
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Store latest sensor data
let dashboardData = {
    heat: { temperature: 'N/A', timestamp: null },
    smoke: { smokeLevel: 'N/A', timestamp: null },
    fire: { fireDetected: false, fireIntensity: 0, timestamp: null },
    wind: { windSpeed: 'N/A', timestamp: null },
    alerts: []
};

client.on('connect', () => {
    console.log('[Dashboard] Connected to MQTT broker');
    
    // Subscribe to all sensor and alert topics
    client.subscribe('/forest_fire/heat_sensor');
    client.subscribe('/forest_fire/smoke_sensor');
    client.subscribe('/forest_fire/fire_sensor');
    client.subscribe('/forest_fire/wind_sensor');
    client.subscribe('/forest_fire/alerts/#');
    
    // Start dashboard display
    startDashboard();
});

client.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        
        // Update sensor data
        if (topic.includes('heat_sensor')) {
            dashboardData.heat = {
                temperature: data.temperature,
                timestamp: data.timestamp
            };
        } else if (topic.includes('smoke_sensor')) {
            dashboardData.smoke = {
                smokeLevel: data.smokeLevel,
                timestamp: data.timestamp
            };
        } else if (topic.includes('fire_sensor')) {
            dashboardData.fire = {
                fireDetected: data.fireDetected,
                fireIntensity: data.fireIntensity,
                timestamp: data.timestamp
            };
        } else if (topic.includes('wind_sensor')) {
            dashboardData.wind = {
                windSpeed: data.windSpeed,
                timestamp: data.timestamp
            };
        } else if (topic.includes('alerts')) {
            // Add alert to history
            dashboardData.alerts.unshift({
                level: data.level,
                message: data.message,
                timestamp: data.timestamp
            });
            
            // Keep only the last 10 alerts
            if (dashboardData.alerts.length > 10) {
                dashboardData.alerts = dashboardData.alerts.slice(0, 10);
            }
        }
        
    } catch (error) {
        console.error('[Dashboard] Error parsing message:', error);
    }
});

function startDashboard() {
    setInterval(() => {
        console.clear();
        displayDashboard();
    }, 1000); // Update every second
}

function displayDashboard() {
    console.log(' FOREST FIRE MONITORING DASHBOARD ');
    console.log('=' .repeat(60));
    console.log('');
    
    // Sensor status
    console.log(' SENSOR STATUS:');
    console.log(` Temperature: ${dashboardData.heat.temperature}°C`);
    console.log(` Smoke Level: ${dashboardData.smoke.smokeLevel}%`);
    console.log(` Fire Detected: ${dashboardData.fire.fireDetected ? 'YES' : 'NO'}`);
    console.log(` Fire Intensity: ${dashboardData.fire.fireIntensity}%`);
    console.log(`  Wind Speed: ${dashboardData.wind.windSpeed} km/h`);
    console.log('');
    
    // Risk assessment
    const riskLevel = calculateRiskLevel();
    console.log('  RISK ASSESSMENT:');
    console.log(`Risk Level: ${riskLevel.level}`);
    console.log(`Risk Score: ${riskLevel.score}/10`);
    console.log('');
    
    // Recent alerts
    console.log(' RECENT ALERTS:');
    if (dashboardData.alerts.length === 0) {
        console.log('No recent alerts');
    } else {
        dashboardData.alerts.forEach((alert, index) => {
            const time = new Date(alert.timestamp).toLocaleTimeString();
            const icon = getAlertIcon(alert.level);
            console.log(`${icon} [${time}] Level ${alert.level}: ${alert.message}`);
        });
    }
    console.log('');
    console.log('=' .repeat(60));
    console.log('Press Ctrl+C to exit');
}

function calculateRiskLevel() {
    let score = 0;
    
    // Temperature risk
    if (dashboardData.heat.temperature !== 'N/A') {
        if (dashboardData.heat.temperature > 60) score += 3;
        else if (dashboardData.heat.temperature > 45) score += 2;
        else if (dashboardData.heat.temperature > 35) score += 1;
    }
    
    // Smoke risk
    if (dashboardData.smoke.smokeLevel !== 'N/A') {
        if (dashboardData.smoke.smokeLevel > 80) score += 3;
        else if (dashboardData.smoke.smokeLevel > 60) score += 2;
        else if (dashboardData.smoke.smokeLevel > 40) score += 1;
    }
    
    // Fire risk
    if (dashboardData.fire.fireDetected) {
        if (dashboardData.fire.fireIntensity > 70) score += 4;
        else if (dashboardData.fire.fireIntensity > 40) score += 3;
        else score += 2;
    }
    
    // Wind risk
    if (dashboardData.wind.windSpeed !== 'N/A') {
        if (dashboardData.wind.windSpeed > 25) score += 2;
        else if (dashboardData.wind.windSpeed > 15) score += 1;
    }
    
    // Determine risk level
    let level = 'LOW';
    if (score >= 8) level = 'CRITICAL';
    else if (score >= 6) level = 'HIGH';
    else if (score >= 4) level = 'MEDIUM';
    else if (score >= 2) level = 'LOW';
    else level = 'NONE';
    
    return { level, score };
}

function getAlertIcon(level) {
    switch(level) {
        case 1: return '⚠️';
        case 2: return '🚨';
        case 3: return '🔥';
        case 4: return '💥';
        default: return 'ℹ️';
    }
}

client.on('error', (err) => {
    console.error('[Dashboard] MQTT Error:', err);
}); 