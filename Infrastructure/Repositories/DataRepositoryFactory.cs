using System;
using Microsoft.Extensions.Configuration;
using FinalProjectAPI.Infrastructure.Interfaces;


namespace FinalProjectAPI.Infrastructure.Interfaces.Repositories
{
    public class DataRepositoryFactory : IDataRepositoryFactory
    {
        private readonly IConfiguration _configuration;

        public DataRepositoryFactory(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public IDataRepository Create(string databaseName)
        {
            var connectionString = _configuration.GetConnectionString(databaseName);
            if (string.IsNullOrEmpty(connectionString))
                throw new ArgumentException($"Connection string '{databaseName}' is null or empty.");

            var dbProvider = _configuration["DbProvider"] ?? "SqlServer"; // Default to SqlServer if not specified

            switch (dbProvider.Trim().ToLower())
            {
                case "mysql":
                    return new MySqlRepository(connectionString);
                case "sqlserver":
                    return new SqlServerRepository(connectionString);
                default:
                    throw new NotSupportedException($"Database provider '{dbProvider}' is not supported.");
            }
        }
    }
}