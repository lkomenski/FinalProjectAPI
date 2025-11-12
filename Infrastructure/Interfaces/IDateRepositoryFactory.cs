using FinalProjectAPI.Infrastructure.Interfaces;

namespace FinalProjectAPI.Infrastructure.Interfaces
{
    public interface IDataRepositoryFactory
    {
        IDataRepository Create(string connectionString);
    }
}