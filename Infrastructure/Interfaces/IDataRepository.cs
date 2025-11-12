namespace FinalProjectAPI.Infrastructure.Interfaces
{
    public interface IDataRepository
    {
        /// <summary>
        /// GetDataAsync without parameters.
        /// </summary>
        /// <param name="storedProc"></param>
        /// <returns>A collection of rows as dictionaries</returns>
        Task<IEnumerable<IDictionary<string, object?>>> GetDataAsync(string storedProc);

        /// <summary>
        /// Gets data from the database using the specified stored procedure and parameters.
        /// </summary>
        /// <param name="storedProc"></param>
        /// <param name="parameters"></param>
        /// <returns></returns>
        Task<IEnumerable<IDictionary<string, object?>>> GetDataAsync(string storedProc, IDictionary<string, object?> parameters);
    }
}