const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const connectDB = require('../config/db');

describe('auth utilities', () => {
  it('creates API errors with status codes', () => {
    const err = new ApiError(401, 'Invalid credentials');
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Invalid credentials');
  });

  it('creates JWT tokens with a configured secret', () => {
    process.env.JWT_SECRET = 'test-secret';
    const token = generateToken('user-123');
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('requires a configured MongoDB URI before connecting', async () => {
    const originalUri = process.env.MONGO_URI;
    delete process.env.MONGO_URI;

    await expect(connectDB()).rejects.toThrow(/MONGO_URI/i);

    if (originalUri) {
      process.env.MONGO_URI = originalUri;
    }
  });
});