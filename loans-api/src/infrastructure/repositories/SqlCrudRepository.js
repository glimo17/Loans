const { getPool, sql } = require('../db/sqlServer');

class SqlCrudRepository {
  constructor(tableConfig) {
    this.config = tableConfig;
    const baseColumns = [
      `${tableConfig.idColumn} AS ${tableConfig.idField}`,
      ...tableConfig.columns.map((c) => `${c.column} AS ${c.field}`)
    ];

    if (tableConfig.timestamp) {
      baseColumns.push(`${tableConfig.timestamp.column} AS ${tableConfig.timestamp.field}`);
    }

    this.selectProjection = baseColumns.join(',\n        ');
    this.insertOutputProjection = baseColumns
      .map((column) => column.replace(/^([A-Za-z0-9_]+)/, 'inserted.$1'))
      .join(', ');
    this.deleteOutputProjection = baseColumns
      .map((column) => column.replace(/^([A-Za-z0-9_]+)/, 'deleted.$1'))
      .join(', ');
  }

  async getAll() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        ${this.selectProjection}
      FROM dbo.${this.config.table}
      ORDER BY ${this.config.idColumn} DESC
    `);

    return result.recordset;
  }

  async getById(id) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          ${this.selectProjection}
        FROM dbo.${this.config.table}
        WHERE ${this.config.idColumn} = @id
      `);

    return result.recordset[0] || null;
  }

  async create(payload) {
    const pool = await getPool();
    const writableColumns = this.config.columns.filter((column) => payload[column.field] !== undefined);

    const request = pool.request();
    writableColumns.forEach((column) => {
      request.input(column.field, column.type(sql), payload[column.field]);
    });

    const columnNames = writableColumns.map((column) => column.column).join(', ');
    const values = writableColumns.map((column) => `@${column.field}`).join(', ');

    const result = await request.query(`
      INSERT INTO dbo.${this.config.table} (${columnNames})
      OUTPUT
        ${this.insertOutputProjection}
      VALUES (${values})
    `);

    return result.recordset[0];
  }

  async update(id, payload) {
    const pool = await getPool();
    const writableColumns = this.config.columns.filter((column) => payload[column.field] !== undefined);

    if (!writableColumns.length) {
      return this.getById(id);
    }

    const request = pool.request();
    request.input('id', sql.Int, id);

    writableColumns.forEach((column) => {
      request.input(column.field, column.type(sql), payload[column.field]);
    });

    const setClause = writableColumns.map((column) => `${column.column} = @${column.field}`).join(', ');

    const result = await request.query(`
      UPDATE dbo.${this.config.table}
      SET ${setClause}
      OUTPUT
        ${this.insertOutputProjection}
      WHERE ${this.config.idColumn} = @id
    `);

    return result.recordset[0] || null;
  }

  async remove(id) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM dbo.${this.config.table}
        OUTPUT
          ${this.deleteOutputProjection}
        WHERE ${this.config.idColumn} = @id
      `);

    return result.recordset[0] || null;
  }
}

module.exports = SqlCrudRepository;
