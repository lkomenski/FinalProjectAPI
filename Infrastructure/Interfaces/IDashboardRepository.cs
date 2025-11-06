using FinalProjectAPI.Models;

namespace FinalProjectAPI.Infrastructure.Interfaces
{
    public interface IDashboardRepository
    {
        Task<DashboardSummary> GetDashboardSummaryAsync();
    }
}
