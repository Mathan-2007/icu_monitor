const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('../models/Patient');
const userRoutes = require('../routes/userRoutes');

let mongo;
let server;
let baseUrl;

const tokenFor = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
const request = (path, { token, method = 'GET', body } = {}) => fetch(`${baseUrl}${path}`, {
  method,
  headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
  body: body ? JSON.stringify(body) : undefined
});
const makeUser = (values = {}) => User.create({ name: 'Test Staff', email: `staff-${Math.random()}@example.org`, password: 'secure-pass-123', role: 'nurse', ...values });

beforeAll(async () => {
  process.env.JWT_SECRET = 'users-test-secret';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  const app = express();
  app.use(express.json());
  app.use('/api/users', userRoutes);
  app.use((err, req, res, next) => require('../middleware/errorHandler')(err, req, res, next));
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/users`;
});

afterAll(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

beforeEach(async () => { await User.deleteMany({}); });

describe('administrator user management API', () => {
  it('allows an administrator to retrieve users without password hashes', async () => {
    const admin = await makeUser({ role: 'admin', name: 'Administrator' });
    await makeUser();
    const response = await request('/', { token: tokenFor(admin) });
    const users = await response.json();
    expect(response.status).toBe(200);
    expect(users).toHaveLength(2);
    expect(users.every((user) => !Object.hasOwn(user, 'password'))).toBe(true);
  });

  it('rejects requests without an administrator session', async () => {
    const nurse = await makeUser();
    const response = await request('/', { token: tokenFor(nurse) });
    expect(response.status).toBe(403);
  });

  it('creates valid accounts, rejects invalid roles and emails, and detects duplicates', async () => {
    const admin = await makeUser({ role: 'admin' });
    const token = tokenFor(admin);
    const valid = { name: 'Maya Doctor', email: 'Maya@example.org', password: 'secure-pass-123', role: 'doctor' };
    const createdResponse = await request('/', { token, method: 'POST', body: valid });
    const created = await createdResponse.json();
    expect(createdResponse.status).toBe(201);
    expect(created.email).toBe('maya@example.org');
    expect(created.password).toBeUndefined();
    expect((await User.findById(created._id).select('+password')).password).not.toBe(valid.password);
    expect((await request('/', { token, method: 'POST', body: { ...valid, email: 'not-an-email' } })).status).toBe(400);
    expect((await request('/', { token, method: 'POST', body: { ...valid, email: 'other@example.org', role: 'viewer' } })).status).toBe(400);
    expect((await request('/', { token, method: 'POST', body: valid })).status).toBe(400);
  });

  it('updates only allowlisted fields and ignores password and privilege injection', async () => {
    const admin = await makeUser({ role: 'admin' });
    const staff = await makeUser();
    const response = await request(`/${staff._id}`, { token: tokenFor(admin), method: 'PATCH', body: {
      name: 'Updated Name', role: 'doctor', password: 'replacement-password', assignedPatients: ['507f1f77bcf86cd799439011'], isActive: true
    } });
    const updated = await response.json();
    const saved = await User.findById(staff._id).select('+password');
    expect(response.status).toBe(200);
    expect(updated.name).toBe('Updated Name');
    expect(updated.role).toBe('doctor');
    expect(updated.password).toBeUndefined();
    expect(saved.password).not.toBe('replacement-password');
    expect(saved.assignedPatients).toHaveLength(0);
  });

  it('persists deactivation and reactivation and blocks the inactive user token', async () => {
    const admin = await makeUser({ role: 'admin' });
    const staff = await makeUser();
    const token = tokenFor(admin);
    expect((await request(`/${staff._id}`, { token, method: 'DELETE' })).status).toBe(200);
    expect((await User.findById(staff._id)).isActive).toBe(false);
    expect((await request('/', { token: tokenFor(staff) })).status).toBe(401);
    expect((await request(`/${staff._id}`, { token, method: 'PATCH', body: { isActive: true } })).status).toBe(200);
    expect((await User.findById(staff._id)).isActive).toBe(true);
  });

  it('prevents self-deactivation and self-demotion', async () => {
    const admin = await makeUser({ role: 'admin' });
    const token = tokenFor(admin);
    expect((await request(`/${admin._id}`, { token, method: 'DELETE' })).status).toBe(400);
    expect((await request(`/${admin._id}`, { token, method: 'PATCH', body: { role: 'nurse' } })).status).toBe(400);
  });
});
