const tableConfigs = [
  {
    resource: 'roles',
    table: 'Roles',
    idColumn: 'RoleId',
    idField: 'roleId',
    timestamp: { column: 'CreatedAt', field: 'createdAt' },
    columns: [
      { column: 'Name', field: 'name', type: (sql) => sql.VarChar(50), required: true },
      { column: 'Description', field: 'description', type: (sql) => sql.VarChar(255) }
    ]
  },
  {
    resource: 'users',
    table: 'Users',
    idColumn: 'UserId',
    idField: 'userId',
    timestamp: { column: 'CreatedAt', field: 'createdAt' },
    columns: [
      { column: 'RoleId', field: 'roleId', type: (sql) => sql.Int, required: true },
      { column: 'FirstName', field: 'firstName', type: (sql) => sql.VarChar(100), required: true },
      { column: 'LastName', field: 'lastName', type: (sql) => sql.VarChar(100), required: true },
      { column: 'Email', field: 'email', type: (sql) => sql.VarChar(150), required: true },
      { column: 'PasswordHash', field: 'passwordHash', type: (sql) => sql.VarChar(255), required: true },
      { column: 'IsActive', field: 'isActive', type: (sql) => sql.Bit }
    ]
  },
  {
    resource: 'statuses',
    table: 'Statuses',
    idColumn: 'StatusId',
    idField: 'statusId',
    columns: [
      { column: 'Name', field: 'name', type: (sql) => sql.VarChar(50), required: true },
      { column: 'Description', field: 'description', type: (sql) => sql.VarChar(255) }
    ]
  },
  {
    resource: 'loan-products',
    table: 'LoanProducts',
    idColumn: 'ProductId',
    idField: 'productId',
    timestamp: { column: 'CreatedAt', field: 'createdAt' },
    columns: [
      { column: 'Name', field: 'name', type: (sql) => sql.VarChar(100), required: true },
      { column: 'Description', field: 'description', type: (sql) => sql.VarChar(255) },
      { column: 'InterestRate', field: 'interestRate', type: (sql) => sql.Decimal(5, 2), required: true },
      { column: 'MaxAmount', field: 'maxAmount', type: (sql) => sql.Decimal(18, 2), required: true },
      { column: 'MinAmount', field: 'minAmount', type: (sql) => sql.Decimal(18, 2), required: true },
      { column: 'TermMonths', field: 'termMonths', type: (sql) => sql.Int, required: true }
    ]
  },
  {
    resource: 'loans',
    table: 'Loans',
    idColumn: 'LoanId',
    idField: 'loanId',
    timestamp: { column: 'CreatedAt', field: 'createdAt' },
    columns: [
      { column: 'UserId', field: 'userId', type: (sql) => sql.Int, required: true },
      { column: 'ProductId', field: 'productId', type: (sql) => sql.Int, required: true },
      { column: 'StatusId', field: 'statusId', type: (sql) => sql.Int, required: true },
      { column: 'Amount', field: 'amount', type: (sql) => sql.Decimal(18, 2), required: true },
      { column: 'InterestRate', field: 'interestRate', type: (sql) => sql.Decimal(5, 2), required: true },
      { column: 'TermMonths', field: 'termMonths', type: (sql) => sql.Int, required: true },
      { column: 'StartDate', field: 'startDate', type: (sql) => sql.Date },
      { column: 'EndDate', field: 'endDate', type: (sql) => sql.Date }
    ]
  },
  {
    resource: 'payments',
    table: 'Payments',
    idColumn: 'PaymentId',
    idField: 'paymentId',
    timestamp: { column: 'CreatedAt', field: 'createdAt' },
    columns: [
      { column: 'LoanId', field: 'loanId', type: (sql) => sql.Int, required: true },
      { column: 'PaymentDate', field: 'paymentDate', type: (sql) => sql.Date, required: true },
      { column: 'Amount', field: 'amount', type: (sql) => sql.Decimal(18, 2), required: true },
      { column: 'PrincipalAmount', field: 'principalAmount', type: (sql) => sql.Decimal(18, 2) },
      { column: 'InterestAmount', field: 'interestAmount', type: (sql) => sql.Decimal(18, 2) }
    ]
  },
  {
    resource: 'loan-history',
    table: 'LoanHistory',
    idColumn: 'HistoryId',
    idField: 'historyId',
    timestamp: { column: 'ChangedAt', field: 'changedAt' },
    columns: [
      { column: 'LoanId', field: 'loanId', type: (sql) => sql.Int, required: true },
      { column: 'StatusId', field: 'statusId', type: (sql) => sql.Int, required: true },
      { column: 'Notes', field: 'notes', type: (sql) => sql.VarChar(255) }
    ]
  }
];

module.exports = tableConfigs;
