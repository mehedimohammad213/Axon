const pool = require('../db/pool');
const OrganizationContext = require('../context/organizationContext');

function withRequestDb(options = {}) {
  return async function withRequestDbMiddleware(req, res, next) {
    let client;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
    } catch (error) {
      if (client) client.release();
      return next(error);
    }

    let settled = false;
    const settle = async (rollback) => {
      if (settled) return;
      settled = true;
      try {
        await client.query(rollback ? 'ROLLBACK' : 'COMMIT');
      } catch (_) { /* ignore */ }
      client.release();
    };

    res.on('finish', () => settle(res.statusCode >= 500));
    res.on('close', () => {
      if (!res.writableEnded) settle(true);
    });

    OrganizationContext.run(null, Boolean(options.bypass), () => {
      OrganizationContext.setClient(client);
      Promise.resolve(OrganizationContext.applyRls())
        .then(() => next())
        .catch((error) => settle(true).finally(() => next(error)));
    }, { client });
  };
}

module.exports = withRequestDb;
