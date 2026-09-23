import OrganizationContext from '../context/organizationContext';
import { query, quoteIdent, type QueryExecutor } from './index';

interface TableQueryOptions {
  scoped?: boolean;
  executor?: QueryExecutor | null;
  softDelete?: boolean;
  withTrashed?: boolean;
  onlyTrashed?: boolean;
}

interface WherePart {
  column: string;
  operator: string;
  value: unknown;
}

interface WhereGroup {
  type: 'AND' | 'OR';
  parts?: WherePart[];
  nestedGroups?: WhereGroup[];
}

class TableQuery {
  tableName: string;
  scoped: boolean;
  executor: QueryExecutor | null;
  selectColumns: string;
  whereGroups: WhereGroup[];
  orderColumn: string | null;
  orderDirection: string;
  limitValue: number | null;
  offsetValue: number | null;
  softDelete: boolean;
  withTrashed: boolean;
  onlyTrashed: boolean;

  constructor(tableName: string, options: TableQueryOptions = {}) {
    this.tableName = tableName;
    this.scoped = options.scoped !== false;
    this.executor = options.executor || null;
    this.selectColumns = '*';
    this.whereGroups = [];
    this.orderColumn = null;
    this.orderDirection = 'desc';
    this.limitValue = null;
    this.offsetValue = null;
    this.softDelete = options.softDelete === true;
    this.withTrashed = options.withTrashed === true;
    this.onlyTrashed = options.onlyTrashed === true;
  }

  clone(): TableQuery {
    const cloned = new TableQuery(this.tableName, {
      scoped: this.scoped,
      executor: this.executor,
      softDelete: this.softDelete,
      withTrashed: this.withTrashed,
      onlyTrashed: this.onlyTrashed,
    });
    cloned.selectColumns = this.selectColumns;
    cloned.whereGroups = this.whereGroups.map((group) => ({
      type: group.type,
      parts: group.parts ? group.parts.map((part) => ({ ...part })) : [],
      nestedGroups: group.nestedGroups
        ? group.nestedGroups.map((nestedGroup) => ({
            type: nestedGroup.type,
            parts: nestedGroup.parts!.map((part) => ({ ...part })),
          }))
        : undefined,
    }));
    cloned.orderColumn = this.orderColumn;
    cloned.orderDirection = this.orderDirection;
    cloned.limitValue = this.limitValue;
    cloned.offsetValue = this.offsetValue;
    return cloned;
  }

  select(...columns: string[]): this {
    this.selectColumns = columns
      .map((column) => (column.includes('.') || column === '*' ? column : quoteIdent(column)))
      .join(', ');
    return this;
  }

  where(
    columnOrConditions: string | Record<string, unknown> | ((this: TableQuery) => void),
    operatorOrValue?: unknown,
    value?: unknown
  ): this {
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

    this.addCondition('AND', columnOrConditions, operatorOrValue as string, value);
    return this;
  }

  orWhere(column: string, operatorOrValue: unknown, value?: unknown): this {
    if (value === undefined) {
      this.addCondition('OR', column, '=', operatorOrValue);
      return this;
    }

    this.addCondition('OR', column, operatorOrValue as string, value);
    return this;
  }

  addCondition(joinType: 'AND' | 'OR', column: string, operator: string, value: unknown): void {
    if (!this.whereGroups.length || this.whereGroups[this.whereGroups.length - 1].type !== joinType) {
      this.whereGroups.push({ type: joinType, parts: [] });
    }

    this.whereGroups[this.whereGroups.length - 1].parts!.push({
      column,
      operator,
      value,
    });
  }

  orderBy(column: string, direction = 'desc'): this {
    this.orderColumn = column;
    this.orderDirection = direction;
    return this;
  }

  limit(value: number): this {
    this.limitValue = value;
    return this;
  }

  offset(value: number): this {
    this.offsetValue = value;
    return this;
  }

  buildSql({ count = false }: { count?: boolean } = {}): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    let paramIndex = 1;
    const wheres: string[] = [];

    if (this.scoped) {
      const orgId = OrganizationContext.get();
      if (orgId && !OrganizationContext.isBypassed()) {
        wheres.push(`${quoteIdent(this.tableName)}.organization_id = $${paramIndex++}`);
        params.push(orgId);
      }
    }

    if (this.softDelete) {
      const deletedAtColumn = `${quoteIdent(this.tableName)}.deleted_at`;
      if (this.onlyTrashed) {
        wheres.push(`${deletedAtColumn} IS NOT NULL`);
      } else if (!this.withTrashed) {
        wheres.push(`${deletedAtColumn} IS NULL`);
      }
    }

    for (const group of this.whereGroups) {
      if (group.nestedGroups) {
        const nestedParts: { join: string; sql: string; value: unknown }[] = [];

        for (const nestedGroup of group.nestedGroups) {
          for (const part of nestedGroup.parts || []) {
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

      const groupParts: string[] = [];

      for (const part of group.parts || []) {
        const column = part.column.includes('.')
          ? part.column
          : `${quoteIdent(this.tableName)}.${quoteIdent(part.column)}`;
        groupParts.push(`${column} ${part.operator} $${paramIndex++}`);
        params.push(part.value);
      }

      if (groupParts.length) {
        wheres.push(`(${groupParts.join(` ${group.type} `)})`);
      }
    }

    const whereClause = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';
    let sql: string;

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

  async execute(): Promise<any[]> {
    const { sql, params } = this.buildSql();
    const result = await query(sql, params, this.executor);
    return result.rows;
  }

  async first(): Promise<any> {
    const cloned = this.clone();
    cloned.limitValue = 1;
    const rows = await cloned.execute();
    return rows[0] || null;
  }

  count(): { first: () => Promise<{ count: number } | undefined> } {
    return {
      first: async () => {
        const { sql, params } = this.buildSql({ count: true });
        const result = await query(sql, params, this.executor);
        return result.rows[0];
      },
    };
  }

  then<TResult1 = any[], TResult2 = never>(
    resolve?: ((value: any[]) => TResult1 | PromiseLike<TResult1>) | null,
    reject?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(resolve, reject);
  }
}

function tableQuery(tableName: string, options: TableQueryOptions = {}): TableQuery {
  return new TableQuery(tableName, options);
}

export { TableQuery, tableQuery };
