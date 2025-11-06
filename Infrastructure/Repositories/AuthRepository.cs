using FinalProjectAPI.Infrastructure.Interfaces;
using FinalProjectAPI.Models;

namespace FinalProjectAPI.Infrastructure.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly SqlDataRepository _sqlData;

        public AuthRepository(SqlDataRepository sqlData)
        {
            _sqlData = sqlData;
        }

        public async Task<User?> LoginAsync(string email, string password)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@Email", email },
                { "@PasswordHash", password }
            };

            var results = await _sqlData.GetDataAsync("UserLogin", parameters);
            var row = results.FirstOrDefault();

            if (row == null) return null;

            return new User
            {
                UserID = Convert.ToInt32(row["UserID"]),
                Email = row["Email"]?.ToString() ?? "",
                Username = row["Username"]?.ToString() ?? "",
                Role = row["Role"]?.ToString() ?? "",
                PasswordHash = row["PasswordHash"]?.ToString() ?? ""
            };
        }

        public async Task<User?> RegisterAsync(User user)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@Email", user.Email },
                { "@PasswordHash", user.PasswordHash },
                { "@Username", user.Username },
                { "@Role", user.Role }
            };

            var results = await _sqlData.GetDataAsync("UserRegister", parameters);
            var row = results.FirstOrDefault();
            if (row == null) return null;

            return new User
            {
                UserID = Convert.ToInt32(row["UserID"]),
                Email = row["Email"]?.ToString() ?? "",
                Username = row["Username"]?.ToString() ?? "",
                Role = row["Role"]?.ToString() ?? ""
            };
        }

        public async Task<bool> UserExistsAsync(string email)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@Email", email }
            };

            var results = await _sqlData.GetDataAsync("CheckUserExists", parameters);
            var row = results.FirstOrDefault();
            return row != null && Convert.ToBoolean(row["Exists"]);
        }
    }
}
