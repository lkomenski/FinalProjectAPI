using FinalProjectAPI.Infrastructure.Interfaces;

namespace FinalProjectAPI.Infrastructure.Interfaces
{
    /// <summary>
    /// Factory interface for creating data repository instances based on the database connection string.
    /// </summary>
    public interface IDataRepositoryFactory
    {
        /// <summary>
        /// Creates a data repository instance for the specified database.
        /// </summary>
        /// <param name="connectionString">The connection string identifier (e.g., "MyGuitarShop", "AP").</param>
        /// <returns>An IDataRepository instance configured for the specified database.</returns>
        IDataRepository Create(string connectionString);
    }
}