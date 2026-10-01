// Slow query  -->  EXPLAIN  -->  Understand execution plan  -->  Identify bottleneck  -->  Consider index/query/schema change  -->  EXPLAIN again  -->  Compare
const email = "alice@example.com";
const explainQuery = async (pool) => {
    // const sql = `EXPLAIN SELECT id, name, email, age, status FROM users WHERE email = ?`;
    // const sql = `EXPLAIN SELECT u.id, u.name, u.email, u.age, u.status FROM users u JOIN posts p ON u.id=p.user_id WHERE email = ?`;
    const sql = `EXPLAIN SELECT * FROM users WHERE status='active'`;
    // EXPLAIN returns one row per table access in the query, not one row per SQL statement.
    const [rows] = await pool.execute(sql, [email]);
    console.table(rows);
    // OUTPUT:
    // ┌─────────┬────┬─────────────┬─────────┬────────────┬─────────┬───────────────┬─────────┬─────────┬─────────┬──────┬──────────┬───────┐
    // │ (index) │ id │ select_type │ table   │ partitions │ type    │ possible_keys │ key     │ key_len │ ref     │ rows │ filtered │ Extra │
    // ├─────────┼────┼─────────────┼─────────┼────────────┼─────────┼───────────────┼─────────┼─────────┼─────────┼──────┼──────────┼───────┤
    // │ 0       │ 1  │ 'SIMPLE'    │ 'users' │ null       │ 'const' │ 'email'       │ 'email' │ '1022'  │ 'const' │ 1    │ 100      │ null  │
    // └─────────┴────┴─────────────┴─────────┴────────────┴─────────┴───────────────┴─────────┴─────────┴─────────┴──────┴──────────┴───────┘
    // MEANING:
    // (index)          the row number in the EXPLAIN output. It is not part of MySQL's EXPLAIN result.
    // id               Identifies a SELECT within the query. Useful when the query has subqueries or UNIONs. (A 'SIMPLE' query normally has id = 1)
    // select_type      Tells you what kind of SELECT this is, e.g. SIMPLE, PRIMARY, SUBQUERY, DERIVED, UNION.
    // table            The table MySQL is accessing at this step. It can also show things like <derived2> for a derived table.
    // partitions	    Which table partitions MySQL will access, if the table is partitioned. NULL means partition pruning isn't applicable/being used.
    // type             How MySQL accesses the table. This is one of the most important columns. Examples include const, eq_ref, ref, range, index, and ALL. Generally, const/eq_ref are very selective access methods, while ALL means a full table scan (ALL is a warning sign).
    //                  const — MySQL found a single row using a unique/indexed constant value. Excellent.
    //                  ref   — MySQL uses a non-unique index to find rows matching a value; multiple rows may match.
    // possible_keys    Indexes MySQL could potentially use for this step based on the query.
    // key	            The index MySQL actually chose to use. NULL means it didn't use an index.
    // key_len	        How many bytes of the chosen index MySQL is actually using. This can help determine how much of a composite index is being utilized.
    // ref              Shows what value/column is being compared against the index. For example, it might say const or db.table.column.
    // rows             MySQL's estimate of how many rows it needs to examine at this step. It's an estimate, not necessarily the actual number.
    // filtered         Estimated percentage of rows that survive the condition applied at this step. For example, 10.00 means MySQL estimates that 10% of the examined rows pass the filter.
    // Extra            Additional information about how MySQL executes the step, such as Using where, Using index, Using temporary, Using filesort, etc.
    //                  Using where → MySQL applies a filtering condition.
    //                  Using index → MySQL can satisfy the query directly from the index (a covering-index situation).
    //                  Using temporary → MySQL needs a temporary table.
    //                  Using filesort → MySQL needs an additional sorting operation; despite the name, it doesn't necessarily mean disk-based sorting.
    //                  Using index condition → Index Condition Pushdown is being used.
};

module.exports = { explainQuery };
