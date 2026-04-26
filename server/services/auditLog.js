const crypto = require('crypto');
const db = require('../db');

const getLastAuditHash = () =>
  new Promise((resolve, reject) => {
    db.get(
      `SELECT current_hash FROM audit_logs ORDER BY id DESC LIMIT 1`,
      [],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row?.current_hash || 'GENESIS');
      }
    );
  });

const logAudit = async ({ action, userId, documentId, details }) => {
  const previousHash = await getLastAuditHash();
  const timestamp = new Date().toISOString();
  const payload = `${action}|${userId || ''}|${documentId || ''}|${timestamp}|${previousHash}|${JSON.stringify(details || {})}`;
  const currentHash = crypto.createHash('sha256').update(payload).digest('hex');

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO audit_logs (action, user_id, document_id, details, timestamp, prev_hash, current_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [action, userId || null, documentId || null, JSON.stringify(details || {}), timestamp, previousHash, currentHash],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      }
    );
  });
};

module.exports = {
  logAudit,
};
