import { JsonStore } from '../utils/JsonStore.js';

const logStore = new JsonStore('logs.json');
const analyticsStore = new JsonStore('analytics.json');

/**
 * Request logger middleware.
 * Logs every request to logs.json and increments API call counter.
 */
export function loggerMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', async () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent') || '',
      userId: req.user?.id || null,
      timestamp: new Date().toISOString(),
    };

    try {
      await logStore.create(log);

      // Increment API call counter in analytics
      const summary = await analyticsStore.findOne((r) => r.type === 'summary');
      if (summary) {
        await analyticsStore.update(summary.id, {
          apiCalls: (summary.apiCalls || 0) + 1,
        });
      }
    } catch {
      // Silently fail — logging should never crash the app
    }
  });

  next();
}
