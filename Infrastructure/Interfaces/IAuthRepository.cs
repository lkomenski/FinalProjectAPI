using FinalProjectAPI.Models;

namespace FinalProjectAPI.Infrastructure.Interfaces
{
    public interface IAuthRepository
    {
        Task<User?> LoginAsync(string email, string password);
        Task<User?> RegisterAsync(User user);
        Task<bool> UserExistsAsync(string email);
    }
}
