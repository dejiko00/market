CREATE DATABASE Market;
GO

USE Market;
GO

CREATE TABLE dbo.ProductType (
    id INT IDENTITY(1, 1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    date_added DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    date_modified DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.ProductVariety (
    id INT IDENTITY(1, 1) PRIMARY KEY,
    id_product_type INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    date_added DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    date_modified DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
    CONSTRAINT UQ_Variety_TypeName
        UNIQUE (id_product_type, name),
    CONSTRAINT FK_Variety_ProductType
        FOREIGN KEY (id_product_type) 
        REFERENCES dbo.ProductType(id) 
        ON DELETE CASCADE
);
GO

CREATE TABLE dbo.ProductPriceHistory (
    id_product_variety INT NOT NULL,
    date_price DATETIME2(0) NOT NULL,
    min_price DECIMAL(10, 2) NOT NULL,
    max_price DECIMAL(10, 2) NOT NULL,
    avg_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT FK_PriceHistory
        FOREIGN KEY (id_product_variety)
        REFERENCES dbo.ProductVariety(id)
        ON DELETE CASCADE,
    CONSTRAINT PK_PriceHistory_Variety
        PRIMARY KEY (id_product_variety, date_price)
);
GO

CREATE INDEX IX_ProductVariety_Type ON dbo.ProductVariety(id_product_type);
CREATE INDEX IX_PriceHistory_Date ON dbo.ProductPriceHistory(date_price);
GO