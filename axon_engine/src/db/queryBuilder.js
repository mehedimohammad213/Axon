const OrganizationContext = require('../context/organizationContext');
const { query, quoteIdent } = require('./index');

class TableQuery {
  constructor(tableName, options = {}) {
    this.tableName = tableName;
    this.scoped = options.scoped !== false;
    this.executor = options.executor || null;
    this.selectColumns = '*';
    this.whereGroups = [];
    this.orderColumn = null;
    this.orderDirection = 'desc';
    this.limitValue = null;
    this.offsetValue = null;
  }

  clone() {
    const cloned = new TableQuery(this.tableName, {
      scoped: this.scoped,
      executor: this.executor,
    });
    cloned.selectColumns = this.selectColumns;
    cloned.whereGroups = this.whereGroups.map((group) => ({
      type: group.type,
      parts: group.parts ? group.parts.map((part) => ({ ...part })) : [],
      nestedGroups: group.nestedGroups
        ? group.nestedGroups.map((nestedGroup) => ({
          type: nestedGroup.type,
          parts: nestedGroup.parts.map((part) => ({ ...part })),
        }))
        : undefined,
    }));
    cloned.orderColumn = this.orderColumn;
    cloned.orderDirection = this.orderDirection;
    cloned.limitValue = this.limitValue;
    cloned.offsetValue = this.offsetValue;
    return cloned;
  }

  select(...columns) {
    this.selectColumns = columns
      .map((column) => (column.includes('.') || column === '*' ? column : quoteIdent(column)))
      .join(', ');
    return this;
  }

  where(columnOrConditions, operatorOrValue, value) {
    if (typeof columnOrConditions === 'function') {
      const nested = new TableQuery(this.tableName, { scoped: false, executor: this.executor });
      columnOrConditions.call(nested);
      this.whereGroups.push({ type: 'AND', nestedGroups: nested.whereGroups });
      return this;
    }

    if (typeof columnOrConditions === 'object') {
      for (const [key, val] of Object.entries(columnOrConditions)) {
        this.addCondition('AND', key, '=', val);
      }
      return this;
    }

    if (value === undefined) {
      this.addCondition('AND', columnOrConditions, '=', operatorOrValue);
      return this;
    }

    this.addCondition('AND', columnOrConditions, operatorOrValue, value);
    return this;
  }

  orWhere(column, operatorOrValue, value) {
    if (value === undefined) {
      this.addCondition('OR', column, '=', operatorOrValue);
      return this;
    }

    this.addCondition('OR', column, operatorOrValue, value);
    return this;
  }

  addCondition(joinType, column, operator, value) {
    if (!this.whereGroups.length || this.whereGroups[this.whereGroups.length - 1].type !== joinType) {
      this.whereGroups.push({ type: joinType, parts: [] });
    }

    this.whereGroups[this.whereGroups.length - 1].parts.push({
      column,
      operator,
      value,
    });
  }

  orderBy(column, direction = 'desc') {
    this.orderColumn = column;
    this.orderDirection = direction;
    return this;
  }

  limit(value) {
    this.limitValue = value;
    return this;
  }

  offset(value) {
    this.offsetValue = value;
    return this;
  }

  buildSql({ count = false } = {}) {
    const params = [];
    let paramIndex = 1;
    const wheres = [];

    if (this.scoped) {
      const orgId = OrganizationContext.get();
      if (orgId && !OrganizationContext.isBypassed()) {
        wheres.push(`${quoteIdent(this.tableName)}.organization_id = $${paramIndex++}`);
        params.push(orgId);
      }
    }

    for (const group of this.whereGroups) {
      if (group.nestedGroups) {
        const nestedParts = [];

        for (const nestedGroup of group.nestedGroups) {
          for (const part of nestedGroup.parts) {
            const column = part.column.includes('.')
              ? part.column
              : `${quoteIdent(this.tableName)}.${quoteIdent(part.column)}`;
            nestedParts.push({
              join: nestedGroup.type,
              sql: `${column} ${part.operator} $${paramIndex++}`,
              value: part.value,
            });
          }
        }

        if (nestedParts.length) {
          let nestedSql = nestedParts[0].sql;
          params.push(nestedParts[0].value);
          for (let i = 1; i < nestedParts.length; i += 1) {
            nestedSql += ` ${nestedParts[i].join} ${nestedParts[i].sql}`;
            params.push(nestedParts[i].value);
          }
          wheres.push(`(${nestedSql})`);
        }
        continue;
      }

      const groupParts = [];

      for (const part of group.parts) {
        const column = part.column.includes('.') ? part.column : `${quoteIdent(this.tableName)}.${quoteIdent(part.column)}`;
        groupParts.push(`${column} ${part.operator} $${paramIndex++}`);
        params.push(part.value);
      }

      if (groupParts.length) {
        wheres.push(`(${groupParts.join(` ${group.type} `)})`);
      }
    }

    const whereClause = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';
    let sql;

    if (count) {
      sql = `SELECT COUNT(*)::int AS count FROM ${quoteIdent(this.tableName)} ${whereClause}`;
    } else {
      sql = `SELECT ${this.selectColumns} FROM ${quoteIdent(this.tableName)} ${whereClause}`;

      if (this.orderColumn) {
        const orderColumn = this.orderColumn.includes('.')
          ? this.orderColumn
          : `${quoteIdent(this.tableName)}.${quoteIdent(this.orderColumn)}`;
        const direction = this.orderDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        sql += ` ORDER BY ${orderColumn} ${direction}`;
      }

      if (this.limitValue !== null) {
        sql += ` LIMIT ${this.limitValue}`;
      }

      if (this.offsetValue !== null) {
        sql += ` OFFSET ${this.offsetValue}`;
      }
    }

    return { sql, params };
  }

  async execute() {
    const { sql, params } = this.buildSql();
    const result = await query(sql, params, this.executor);
    return result.rows;
  }

  async first() {
    const cloned = this.clone();
    cloned.limitValue = 1;
    const rows = await cloned.execute();
    return rows[0] || null;
  }

  count() {
    return {
      first: async () => {
        const { sql, params } = this.buildSql({ count: true });
        const result = await query(sql, params, this.executor);
        return result.rows[0];
      },
    };
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

function tableQuery(tableName, options = {}) {
  return new TableQuery(tableName, options);
}

module.exports = { TableQuery, tableQuery };
