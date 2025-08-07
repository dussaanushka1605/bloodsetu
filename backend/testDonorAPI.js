const axios = require('axios');

async function testDonorAPI() {
    console.log('🧪 Testing Donor Search API...\n');
    
    try {
        // Test 1: Get all donors
        console.log('1️⃣ Testing: Get all donors');
        const response1 = await axios.get('http://localhost:5001/api/hospital/search-donors', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(`✅ Success! Found ${response1.data.length} donors`);
        console.log(`📊 Sample donors:`, response1.data.slice(0, 3).map(d => `${d.name} (${d.bloodGroup})`));
        
        // Test 2: Filter by blood type
        console.log('\n2️⃣ Testing: Filter by blood type (A+)');
        const response2 = await axios.get('http://localhost:5001/api/hospital/search-donors?bloodGroup=A+', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(`✅ Success! Found ${response2.data.length} A+ donors`);
        console.log(`📊 A+ donors:`, response2.data.map(d => `${d.name} from ${d.city}`));
        
        // Test 3: Filter by blood type (B+)
        console.log('\n3️⃣ Testing: Filter by blood type (B+)');
        const response3 = await axios.get('http://localhost:5001/api/hospital/search-donors?bloodGroup=B+', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(`✅ Success! Found ${response3.data.length} B+ donors`);
        console.log(`📊 B+ donors:`, response3.data.map(d => `${d.name} from ${d.city}`));
        
        console.log('\n🎉 All API tests completed successfully!');
        console.log('📈 Total donors in database:', response1.data.length);
        
    } catch (error) {
        console.error('❌ API Test Failed:', error.response?.data || error.message);
        console.error('❌ Full error:', error);
        console.log('🔧 Make sure the backend server is running on port 5001');
    }
}

testDonorAPI(); 