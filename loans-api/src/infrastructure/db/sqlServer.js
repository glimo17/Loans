const sql = require('mssql');
const config = require('../../shared/config');

const poolPromises = new Map();

const buildDbConfig = (databaseName) => ({
  ...config.db,
  database: databaseName
});

const getPool = async (databaseName = config.db.database) => {
  if (!poolPromises.has(databaseName)) {
    const promise = new sql.ConnectionPool(buildDbConfig(databaseName))
      .connect()
      .then((pool) => pool)
      .catch((error) => {
        poolPromises.delete(databaseName);
        throw error;
      });

    poolPromises.set(databaseName, promise);
  }

  return poolPromises.get(databaseName);
};

const ensureDatabaseExists = async () => {
  const masterPool = await getPool('master');
  await masterPool.request().query(`
    IF DB_ID('${config.db.database}') IS NULL
    BEGIN
      CREATE DATABASE [${config.db.database}]
    END
  `);
};

const initializeDatabase = async () => {
  await ensureDatabaseExists();
  const pool = await getPool();

  await pool.request().query(`
    IF OBJECT_ID('dbo.Roles', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Roles (
        RoleId INT IDENTITY(1,1) PRIMARY KEY,
        Name VARCHAR(50) NOT NULL,
        Description VARCHAR(255),
        CreatedAt DATETIME DEFAULT GETDATE()
      )
    END

    IF OBJECT_ID('dbo.Users', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Users (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        RoleId INT NOT NULL,
        FirstName VARCHAR(100) NOT NULL,
        LastName VARCHAR(100) NOT NULL,
        Email VARCHAR(150) UNIQUE NOT NULL,
        PasswordHash VARCHAR(255) NOT NULL,
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId)
      )
    END

    IF OBJECT_ID('dbo.Statuses', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Statuses (
        StatusId INT IDENTITY(1,1) PRIMARY KEY,
        Name VARCHAR(50) NOT NULL,
        Description VARCHAR(255)
      )
    END

    IF OBJECT_ID('dbo.LoanProducts', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.LoanProducts (
        ProductId INT IDENTITY(1,1) PRIMARY KEY,
        Name VARCHAR(100) NOT NULL,
        Description VARCHAR(255),
        InterestRate DECIMAL(5,2) NOT NULL,
        MaxAmount DECIMAL(18,2) NOT NULL,
        MinAmount DECIMAL(18,2) NOT NULL,
        TermMonths INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
      )
    END

    IF OBJECT_ID('dbo.Loans', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Loans (
        LoanId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        ProductId INT NOT NULL,
        StatusId INT NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        InterestRate DECIMAL(5,2) NOT NULL,
        TermMonths INT NOT NULL,
        StartDate DATE,
        EndDate DATE,
        CreatedAt DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Loans_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_Loans_Products FOREIGN KEY (ProductId) REFERENCES dbo.LoanProducts(ProductId),
        CONSTRAINT FK_Loans_Statuses FOREIGN KEY (StatusId) REFERENCES dbo.Statuses(StatusId)
      )
    END

    IF OBJECT_ID('dbo.Payments', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Payments (
        PaymentId INT IDENTITY(1,1) PRIMARY KEY,
        LoanId INT NOT NULL,
        PaymentDate DATE NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        PrincipalAmount DECIMAL(18,2),
        InterestAmount DECIMAL(18,2),
        CreatedAt DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Payments_Loans FOREIGN KEY (LoanId) REFERENCES dbo.Loans(LoanId)
      )
    END

    IF OBJECT_ID('dbo.LoanHistory', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.LoanHistory (
        HistoryId INT IDENTITY(1,1) PRIMARY KEY,
        LoanId INT NOT NULL,
        StatusId INT NOT NULL,
        ChangedAt DATETIME DEFAULT GETDATE(),
        Notes VARCHAR(255),
        CONSTRAINT FK_LoanHistory_Loans FOREIGN KEY (LoanId) REFERENCES dbo.Loans(LoanId),
        CONSTRAINT FK_LoanHistory_Status FOREIGN KEY (StatusId) REFERENCES dbo.Statuses(StatusId)
      )
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Roles)
    BEGIN
      INSERT INTO dbo.Roles (Name, Description)
      VALUES
      ('Admin', 'Administrador del sistema'),
      ('Customer', 'Cliente')
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Statuses)
    BEGIN
      INSERT INTO dbo.Statuses (Name, Description)
      VALUES
      ('Pending', 'Pendiente'),
      ('Approved', 'Aprobado'),
      ('Rejected', 'Rechazado'),
      ('Active', 'Activo'),
      ('Paid', 'Pagado')
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.LoanProducts)
    BEGIN
      INSERT INTO dbo.LoanProducts (Name, Description, InterestRate, MaxAmount, MinAmount, TermMonths)
      VALUES
      ('Personal Loan', 'Prestamo personal basico', 12.5, 10000, 500, 24),
      ('Car Loan', 'Prestamo para vehiculo', 8.5, 30000, 2000, 60),
      ('Quick Loan', 'Prestamo rapido', 15.0, 2000, 100, 12)
    END
  `);
};

module.exports = {
  sql,
  getPool,
  initializeDatabase
};
