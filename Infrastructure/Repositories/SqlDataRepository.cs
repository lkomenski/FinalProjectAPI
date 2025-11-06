using System.Data;
using Microsoft.Data.SqlClient;

namespace FinalProjectAPI.Infrastructure.Repositories
{
    public class SqlDataRepository
    {
        private readonly string _connectionString;

        public SqlDataRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Missing connection string 'DefaultConnection'");
        }

        public async Task<IEnumerable<IDictionary<string, object?>>> GetDataAsync(
            string storedProc, IDictionary<string, object?>? parameters = null)
        {
            var results = new List<IDictionary<string, object?>>();

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var command = new SqlCommand(storedProc, connection);
            command.CommandType = CommandType.StoredProcedure;

            if (parameters != null)
            {
                foreach (var kvp in parameters)
                {
                    var name = kvp.Key.StartsWith("@") ? kvp.Key : "@" + kvp.Key;
                    command.Parameters.AddWithValue(name, kvp.Value ?? DBNull.Value);
                }
            }

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var row = new Dictionary<string, object?>();
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
                }
                results.Add(row);
            }

            return results;
        }

        public async Task<int> ExecuteNonQueryAsync(
            string storedProc, IDictionary<string, object?>? parameters = null)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var command = new SqlCommand(storedProc, connection);
            command.CommandType = CommandType.StoredProcedure;

            if (parameters != null)
            {
                foreach (var kvp in parameters)
                {
                    var name = kvp.Key.StartsWith("@") ? kvp.Key : "@" + kvp.Key;
                    command.Parameters.AddWithValue(name, kvp.Value ?? DBNull.Value);
                }
            }

            return await command.ExecuteNonQueryAsync();
        }
    }
}
