// tu_proyecto/test/api.test.js

const request = require('supertest');
const API_BASE_URL = 'http://localhost:3000'; 

describe('CRUD Profile API Endpoints (E2E with Supertest)', () => {
    let testProfileId; 


    it('should create a new profile (POST /api/profiles)', async () => {
        const newProfileData = {
            name: 'Supertest User',
            email: `supertest.user.${Date.now()}@example.com`,
            phone_number: '+1234567890',
            nationality_id: 1, 
        };

        const response = await request(API_BASE_URL)
            .post('/api/profiles')
            .send(newProfileData)
            .set('Accept', 'application/json')
            .expect(201);

        console.log(response.body.profile.id);
        expect(response.body).toBeDefined();
        expect(response.body.profile).toBeDefined();
        expect(response.body.profile.id).toBeDefined();
        expect(response.body.profile.email).toBe(newProfileData.email);
        expect(response.body.message).toBe('Profile created successfully.');
        testProfileId = response.body.profile.id;
    });

    it('should get all profiles (GET /api/profiles)', async () => {
        const response = await request(API_BASE_URL)
            .get('/api/profiles')
            .expect(200);

        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body.profiles)).toBe(true);
        expect(response.body.count).toBeGreaterThanOrEqual(1); 
        expect(response.body.profiles.some(p => p.id === testProfileId)).toBe(true);
    });

    it('should get a specific profile by ID (GET /api/profiles/:id)', async () => {
        expect(testProfileId).toBeDefined(); 

        const response = await request(API_BASE_URL)
            .get(`/api/profiles/${testProfileId}`)
            .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body.profile).toBeDefined();
        expect(response.body.profile.id).toBe(testProfileId);
    });

    it('should update a specific profile (PUT /api/profiles/:id)', async () => {
        expect(testProfileId).toBeDefined();
        const updatedName = 'Supertest Updated User Name';

        const response = await request(API_BASE_URL)
            .put(`/api/profiles/${testProfileId}`)
            .send({ name: updatedName, description: "Updated via supertest." })
            .set('Accept', 'application/json')
            .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body.profile).toBeDefined();
        expect(response.body.profile.id).toBe(testProfileId);
        expect(response.body.profile.name).toBe(updatedName);
        expect(response.body.message).toBe('Profile updated successfully.');

        const checkResponse = await request(API_BASE_URL).get(`/api/profiles/${testProfileId}`).expect(200);
        expect(checkResponse.body.profile.description).toBe("Updated via supertest.");
    });

    it('should soft delete a specific profile (DELETE /api/profiles/:id)', async () => {
        const deleteProfileEmail = `supertest.delete.${Date.now()}@example.com`;
        const createResponse = await request(API_BASE_URL)
            .post('/api/profiles')
            .send({
                name: 'Temp Delete Supertest User',
                email: deleteProfileEmail,
                phone_number: '+1234567899',
                nationality_id: 1, 
            })
            .set('Accept', 'application/json')
            .expect(201);
        const deleteProfileId = createResponse.body.profile.id;

        const response = await request(API_BASE_URL)
            .delete(`/api/profiles/${deleteProfileId}`)
            .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body.message).toContain('successfully deactivated (soft deleted).');

    });

    // it('should return 404 for deleting a non-existent profile', async () => {
    //     const nonExistentId = '00000000-0000-4000-8000-000000000000';

    //     const response = await request(API_BASE_URL)
    //         .delete(`/api/profiles/${nonExistentId}`)
    //         .expect(404);

    //     expect(response.body).toBeDefined();
    //     expect(response.body.message).toContain('Profile with ID');
    //     expect(response.body.message).toContain('not found.');
    // });
});