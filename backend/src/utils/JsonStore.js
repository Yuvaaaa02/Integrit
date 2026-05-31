import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * JsonStore — A reusable JSON-file-based database engine.
 *
 * Features:
 * - Auto-creates files if missing
 * - Atomic writes (write to temp, then rename)
 * - Mutex-style locking for concurrent safety
 * - CRUD with UUID ids and timestamps
 * - Soft-delete support
 * - Pagination, filtering, search, sorting
 * - Backup system
 */
export class JsonStore {
  #filePath;
  #lockPromise = Promise.resolve();

  /**
   * @param {string} fileName — e.g. 'users.json'
   * @param {string} [storageDir] — defaults to backend/storage/
   */
  constructor(fileName, storageDir) {
    const baseDir = storageDir || path.resolve(__dirname, '../../storage');
    this.#filePath = path.join(baseDir, fileName);
  }

  /** Ensure the file exists, create with empty array if not */
  async #ensureFile() {
    try {
      await fs.access(this.#filePath);
    } catch {
      await fs.mkdir(path.dirname(this.#filePath), { recursive: true });
      await fs.writeFile(this.#filePath, '[]', 'utf-8');
    }
  }

  /** Read all records from file */
  async #read() {
    await this.#ensureFile();
    const raw = await fs.readFile(this.#filePath, 'utf-8');
    try {
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      // Corrupted file — reset
      await fs.writeFile(this.#filePath, '[]', 'utf-8');
      return [];
    }
  }

  /** Atomic write: write to temp file, then rename */
  async #write(data) {
    const tempPath = this.#filePath + '.tmp';
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempPath, this.#filePath);
  }

  /** Serialize concurrent writes through a promise chain */
  #withLock(fn) {
    const next = this.#lockPromise.then(() => fn()).catch((err) => {
      throw err;
    });
    this.#lockPromise = next.catch(() => {});
    return next;
  }

  // ─── CRUD OPERATIONS ─────────────────────────────────────

  /** Create a new record */
  async create(record) {
    return this.#withLock(async () => {
      const data = await this.#read();
      const now = new Date().toISOString();
      const newRecord = {
        id: uuidv4(),
        ...record,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      data.push(newRecord);
      await this.#write(data);
      return newRecord;
    });
  }

  /** Create multiple records at once */
  async createMany(records) {
    return this.#withLock(async () => {
      const data = await this.#read();
      const now = new Date().toISOString();
      const newRecords = records.map((record) => ({
        id: uuidv4(),
        ...record,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      }));
      data.push(...newRecords);
      await this.#write(data);
      return newRecords;
    });
  }

  /**
   * Find all records with optional filtering, pagination, sorting, and search.
   * @param {Object} [options]
   * @param {Object} [options.filters] — key-value pairs to match
   * @param {string} [options.search] — search query
   * @param {string[]} [options.searchFields] — fields to search in
   * @param {string} [options.sortBy] — field to sort by
   * @param {string} [options.sortOrder] — 'asc' or 'desc'
   * @param {number} [options.page] — page number (1-indexed)
   * @param {number} [options.limit] — items per page
   * @param {boolean} [options.includeDeleted] — include soft-deleted records
   */
  async findAll(options = {}) {
    const data = await this.#read();
    let results = options.includeDeleted
      ? data
      : data.filter((r) => !r.deletedAt);

    // Apply filters
    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (value !== undefined && value !== null && value !== '') {
          results = results.filter((r) => {
            if (Array.isArray(r[key])) {
              return r[key].includes(value);
            }
            return String(r[key]).toLowerCase() === String(value).toLowerCase();
          });
        }
      }
    }

    // Apply search
    if (options.search && options.searchFields?.length) {
      const q = options.search.toLowerCase();
      results = results.filter((r) =>
        options.searchFields.some((field) => {
          const val = r[field];
          if (Array.isArray(val)) return val.some((v) => String(v).toLowerCase().includes(q));
          return val && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Total before pagination
    const total = results.length;

    // Sort
    if (options.sortBy) {
      const order = options.sortOrder === 'desc' ? -1 : 1;
      results.sort((a, b) => {
        const aVal = a[options.sortBy] ?? '';
        const bVal = b[options.sortBy] ?? '';
        if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * order;
        return String(aVal).localeCompare(String(bVal)) * order;
      });
    }

    // Pagination
    let page = 1;
    let limit = total || 1;
    if (options.page && options.limit) {
      page = Math.max(1, parseInt(options.page, 10));
      limit = Math.max(1, parseInt(options.limit, 10));
      const start = (page - 1) * limit;
      results = results.slice(start, start + limit);
    }

    return {
      data: results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Find a single record by ID */
  async findById(id) {
    const data = await this.#read();
    return data.find((r) => r.id === id && !r.deletedAt) || null;
  }

  /** Find a single record matching a predicate function or filter object */
  async findOne(predicate) {
    const data = await this.#read();
    if (typeof predicate === 'function') {
      return data.find((r) => !r.deletedAt && predicate(r)) || null;
    }
    // If it's a filter object, e.g. { slug: 'val' }
    return data.find((r) => {
      if (r.deletedAt) return false;
      return Object.entries(predicate).every(([key, val]) => {
        if (val === undefined || val === null) return true;
        return String(r[key]).toLowerCase() === String(val).toLowerCase();
      });
    }) || null;
  }

  /** Find all records matching a filter object */
  async find(filters = {}) {
    const { data } = await this.findAll({ filters });
    return data;
  }

  /** Update a record by ID (partial update) */
  async update(id, updates) {
    return this.#withLock(async () => {
      const data = await this.#read();
      const index = data.findIndex((r) => r.id === id && !r.deletedAt);
      if (index === -1) return null;

      data[index] = {
        ...data[index],
        ...updates,
        id: data[index].id, // prevent id overwrite
        createdAt: data[index].createdAt, // preserve original
        updatedAt: new Date().toISOString(),
      };
      await this.#write(data);
      return data[index];
    });
  }

  /** Soft-delete a record by ID */
  async delete(id) {
    return this.#withLock(async () => {
      const data = await this.#read();
      const index = data.findIndex((r) => r.id === id && !r.deletedAt);
      if (index === -1) return null;

      data[index].deletedAt = new Date().toISOString();
      data[index].updatedAt = new Date().toISOString();
      await this.#write(data);
      return data[index];
    });
  }

  /** Permanently remove a record */
  async hardDelete(id) {
    return this.#withLock(async () => {
      const data = await this.#read();
      const index = data.findIndex((r) => r.id === id);
      if (index === -1) return null;

      const removed = data.splice(index, 1)[0];
      await this.#write(data);
      return removed;
    });
  }

  /** Count records matching optional filters */
  async count(filters = {}) {
    const { pagination } = await this.findAll({ filters });
    return pagination.total;
  }

  /** Get all records (raw, including deleted) */
  async raw() {
    return this.#read();
  }

  /** Replace entire store contents (used for seeding) */
  async seed(records) {
    return this.#withLock(async () => {
      await this.#ensureFile();
      const existing = await this.#read();
      if (existing.length > 0) return false; // Don't re-seed

      const now = new Date().toISOString();
      const seeded = records.map((r) => ({
        id: r.id || uuidv4(),
        ...r,
        createdAt: r.createdAt || now,
        updatedAt: r.updatedAt || now,
        deletedAt: null,
      }));
      await this.#write(seeded);
      return true;
    });
  }

  /** Create a timestamped backup of the current data */
  async backup() {
    await this.#ensureFile();
    const backupDir = path.join(path.dirname(this.#filePath), 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = path.basename(this.#filePath, '.json');
    const backupPath = path.join(backupDir, `${baseName}_${timestamp}.json`);
    await fs.copyFile(this.#filePath, backupPath);
    return backupPath;
  }
}
