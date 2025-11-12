using Microsoft.Data.SqlClient;
using System.Data;
using FinalProjectAPI.Infrastructure.Interfaces;

namespace FinalProjectAPI.Infrastructure.Interfaces.Repositories
{
    public class SqlServerRepository : IDataRepository
{
    private readonly string _connectionString = string.Empty;

    public SqlServerRepository(string connectionString)
    {
        _connectionString = connectionString ?? string.Empty;
    }

    public async Task<IEnumerable<IDictionary<string, object?>>> GetDataAsync(string storedProc)
    {
        var results = new List<IDictionary<string, object?>>();

        using (var connection = new SqlConnection(_connectionString))
        {
            using (var command = new SqlCommand(storedProc, connection))
            {
                command.CommandType = CommandType.StoredProcedure;

                await connection.OpenAsync();

                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var newRow = new Dictionary<string, object?>();
                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            newRow[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
                        }
                        results.Add(newRow);
                    }
                }
            }
        }

        return results;
    }

    public async Task<IEnumerable<IDictionary<string, object?>>> GetDataAsync(string storedProc, IDictionary<string, object?>? parameters)
    {
        var results = new List<IDictionary<string, object?>>();

        using (var connection = new SqlConnection(_connectionString))
        {
            using (var command = new SqlCommand(storedProc, connection))
            {
                command.CommandType = CommandType.StoredProcedure;

                if (parameters != null)
                {
                    foreach (var kvp in parameters)
                    {
                        // Ensure parameter name starts with @
                        var paramName = kvp.Key.StartsWith("@") ? kvp.Key : "@" + kvp.Key;
                        command.Parameters.AddWithValue(paramName, kvp.Value ?? DBNull.Value);
                    }
                }

                await connection.OpenAsync();

                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var row = new Dictionary<string, object?>();
                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            var name = reader.GetName(i);
                            var value = await reader.IsDBNullAsync(i) ? null : reader.GetValue(i);
                            row[name] = value;
                        }

                        results.Add(row);
                    }
                }
            }
        }

        return results;
    }
}
}