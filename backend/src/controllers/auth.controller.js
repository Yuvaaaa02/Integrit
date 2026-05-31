import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { JsonStore } from '../utils/JsonStore.js';
import { successResponse, errorResponse } from '../utils/response.js';

const userStore = new JsonStore('admins.json');
const sessionStore = new JsonStore('sessions.json');
const logStore = new JsonStore('logs.json');

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Support lookup by either email or username
    const user = await userStore.findOne((u) => u.email === email || u.username === email);
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to session store
    await sessionStore.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Log the successful login
    await logStore.create({
      level: 'INFO',
      message: `Admin ${user.email} logged in successfully`,
      timestamp: new Date().toISOString(),
      ip: req.ip,
    });

    return successResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: accessToken,
      refreshToken: refreshToken,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    // Verify session in store
    const session = await sessionStore.findOne({ token: refreshToken });
    if (!session) {
      return errorResponse(res, 'Invalid refresh token session', 401);
    }

    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      await sessionStore.delete(session.id);
      return errorResponse(res, 'Refresh token expired', 401);
    }

    // Verify token content
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.secret);
    } catch (err) {
      await sessionStore.delete(session.id);
      return errorResponse(res, 'Invalid refresh token signature', 401);
    }

    const user = await userStore.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const newAccessToken = generateAccessToken(user);
    return successResponse(res, { token: newAccessToken }, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const session = await sessionStore.findOne({ token: refreshToken });
      if (session) {
        await sessionStore.delete(session.id);
      }
    }

    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await userStore.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
}
