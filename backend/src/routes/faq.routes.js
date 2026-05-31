import { Router } from 'express';
import { JsonStore } from '../utils/JsonStore.js';
import { successResponse } from '../utils/response.js';

const router = Router();
const faqStore = new JsonStore('faqs.json');

router.get('/', async (req, res, next) => {
  try {
    const faqs = await faqStore.find({});
    return successResponse(res, faqs, 'FAQs retrieved successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
