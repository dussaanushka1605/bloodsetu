const axios = require('axios');

const baseURL = 'http://localhost:5001/api';

async function testEndpoints() {
    try {
        console.log('Testing Admin Login...');
        const adminLogin = await axios.post(`${baseURL}/admin/login`, {
            email: 'admin@raktsetu.com',
            password: 'Admin@123'
        });
        console.log('Admin Login Successful:', adminLogin.data);
        const adminToken = adminLogin.data.token;

        console.log('\nTesting Donor Registration...');
        const timestamp = Date.now();
        const donorData = {
            name: 'John Doe',
            email: `johndoe${timestamp}@example.com`,
            password: 'password123',
            bloodGroup: 'A+',
            phone: '1234567890',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            pincode: '10001'
        };
        const donorReg = await axios.post(`${baseURL}/auth/register/donor`, donorData);
        console.log('Donor Registration Successful:', donorReg.data);

        console.log('\nTesting Hospital Registration...');
        const hospitalReg = await axios.post(`${baseURL}/auth/register/hospital`, {
            name: 'City Hospital',
            email: `cityhospital${timestamp}@example.com`,
            password: 'hospital123',
            licenseNumber: `HOSP${timestamp}`,
            phone: '9876543210',
            address: '456 Hospital Ave'
        });
        console.log('Hospital Registration Successful:', hospitalReg.data);

        console.log('\nTesting Hospital Login (Before Verification)...');
        try {
            await axios.post(`${baseURL}/auth/login/hospital`, {
                email: `cityhospital${timestamp}@example.com`,
                password: 'hospital123'
            });
        } catch (error) {
            console.log('Hospital Login Failed (Expected):', error.response.data);
        }

        console.log('\nTesting Admin Verifying Hospital...');
        const hospitals = await axios.get(`${baseURL}/admin/hospitals`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const hospital = hospitals.data.find(h => h.email === `cityhospital${timestamp}@example.com`);
        const hospitalId = hospital._id;

        const verifyHospital = await axios.patch(
            `${baseURL}/admin/hospitals/${hospitalId}/verify`,
            {},
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('Hospital Verification Successful:', verifyHospital.data);

        console.log('\nTesting Hospital Login (After Verification)...');
        const hospitalLogin = await axios.post(`${baseURL}/auth/login/hospital`, {
            email: `cityhospital${timestamp}@example.com`,
            password: 'hospital123'
        });
        console.log('Hospital Login Successful:', hospitalLogin.data);

        console.log('\nTesting Donor Login...');
        const donorLogin = await axios.post(`${baseURL}/auth/login/donor`, {
            email: donorReg.data.donor.email,
            password: 'password123'
        });
        console.log('Donor Login Successful:', donorLogin.data);

        console.log('\nAll tests completed successfully!');
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testEndpoints(); 