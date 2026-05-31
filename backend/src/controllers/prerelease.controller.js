import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JsonStore } from '../utils/JsonStore.js';
import { successResponse, errorResponse } from '../utils/response.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

const configStore = new JsonStore('prerelease-config.json', DATA_DIR);
const enrollmentsStore = new JsonStore('prerelease-enrollments.json', DATA_DIR);

/**
 * Public: Enroll a user in the pre-release program
 */
export async function enroll(req, res, next) {
  try {
    let { name, email, phone } = req.body;

    // Sanitization & trim
    name = (name || '').trim();
    email = (email || '').trim().toLowerCase();
    phone = (phone || '').trim();

    // Validations
    if (!name) {
      return errorResponse(res, 'Name is required.', 400);
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse(res, 'A valid email address is required.', 400);
    }
    if (!phone) {
      return errorResponse(res, 'Phone number is required.', 400);
    }

    // Duplicate email check
    const existing = await enrollmentsStore.findOne((record) => record.email === email);
    if (existing) {
      return errorResponse(res, 'This email address is already enrolled in the pre-release program.', 400);
    }

    const newEnrollment = await enrollmentsStore.create({
      name,
      email,
      phone
    });

    return successResponse(res, newEnrollment, 'Successfully joined the pre-release program!', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Retrieve all enrollments
 */
export async function getEnrollments(req, res, next) {
  try {
    const list = await enrollmentsStore.find({});
    // Sort descending by creation date
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return successResponse(res, list, 'Enrollments retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Export enrollments as CSV
 */
export async function exportCsv(req, res, next) {
  try {
    const list = await enrollmentsStore.find({});
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Escape CSV values
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      const stringified = String(str);
      if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    let csvContent = 'Name,Email,Phone,Joined At\n';
    for (const record of list) {
      csvContent += `${escapeCsv(record.name)},${escapeCsv(record.email)},${escapeCsv(record.phone)},${escapeCsv(record.createdAt)}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="prerelease-enrollments.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

/**
 * Public: Get launching config
 */
export async function getConfig(req, res, next) {
  try {
    const list = await configStore.find({});
    if (list.length === 0) {
      // Return default config representation if settings are missing
      const defaultConfig = {
        enabled: true,
        title: "Integrit Sales Autopilot Agent",
        subtitle: "Hire our next-gen autonomous SDR workflow to book qualified calls directly on your calendar, 24/7.",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        thumbnail: "grad-1",
        ctaText: "Enroll Now",
        badge: "Coming Soon"
      };
      return successResponse(res, defaultConfig, 'Default config returned');
    }
    return successResponse(res, list[0], 'Launcher config retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Update launching config
 */
export async function updateConfig(req, res, next) {
  try {
    const list = await configStore.find({});
    let targetConfig;

    if (list.length === 0) {
      targetConfig = await configStore.create({
        enabled: true,
        title: "Integrit Sales Autopilot Agent",
        subtitle: "Hire our next-gen autonomous SDR workflow to book qualified calls directly on your calendar, 24/7.",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        thumbnail: "grad-1",
        ctaText: "Enroll Now",
        badge: "Coming Soon"
      });
    } else {
      targetConfig = list[0];
    }

    const { enabled, title, subtitle, videoUrl, thumbnail, ctaText, badge } = req.body;

    const payload = {};
    if (enabled !== undefined) payload.enabled = Boolean(enabled);
    if (title !== undefined) payload.title = String(title);
    if (subtitle !== undefined) payload.subtitle = String(subtitle);
    if (videoUrl !== undefined) payload.videoUrl = String(videoUrl);
    if (thumbnail !== undefined) payload.thumbnail = String(thumbnail);
    if (ctaText !== undefined) payload.ctaText = String(ctaText);
    if (badge !== undefined) payload.badge = String(badge);

    const updated = await configStore.update(targetConfig.id, payload);
    return successResponse(res, updated, 'Launcher configuration updated successfully');
  } catch (error) {
    next(error);
  }
}
