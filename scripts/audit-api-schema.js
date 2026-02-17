const axios = require('axios');

async function auditSchema() {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ODgwNTVkM2Y2NDc2ZDRiZmE0ZTgwOCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzcxMTYwMjYyLCJleHAiOjE3NzM3NTIyNjJ9.8OyjBCLbbO9GNxWVS5-Ta4mXqsDKMCuR9x3Z7n7qNWE";
    const baseUrl = "http://localhost:5000";
    
    console.log(`--- Initiating API Schema Audit ---`);
    console.log(`Endpoint: ${baseUrl}/api/bookings`);
    
    try {
        const response = await axios.get(`${baseUrl}/api/bookings`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: { limit: 1 }
        });
        
        console.log("--- RAW RESPONSE DATA ---");
        console.log(JSON.stringify(response.data, null, 2));
        console.log("--- END OF AUDIT ---");
    } catch (error) {
        console.error("Audit Failed:", error.response?.data || error.message);
    }
}

auditSchema();
