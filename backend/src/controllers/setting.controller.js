import { JsonStore } from '../utils/JsonStore.js';
import { successResponse, errorResponse } from '../utils/response.js';

const settingsStore = new JsonStore('settings.json');

export async function getSettings(req, res, next) {
  try {
    const list = await settingsStore.find({});
    if (list.length === 0) {
      return errorResponse(res, 'Settings not found', 404);
    }
    return successResponse(res, list[0], 'Settings retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const list = await settingsStore.find({});
    if (list.length === 0) {
      return errorResponse(res, 'Settings not found', 404);
    }

    const currentSettings = list[0];
    const updated = await settingsStore.update(currentSettings.id, req.body);
    return successResponse(res, updated, 'Settings updated successfully');
  } catch (error) {
    next(error);
  }
}
