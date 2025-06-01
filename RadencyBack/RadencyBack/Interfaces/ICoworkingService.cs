using RadencyBack.DTO.coworking;

namespace RadencyBack.Interfaces
{
    public interface ICoworkingService
    {
        Task<CoworkingDetailsDTO?> GetCoworkingDetailsAsync(int coworkingId);
        Task<bool> CheckAvailabilityLOCAsync(int workspaceUnitId, DateTime startTimeLOC, DateTime endTimeLOC, int? excludeBookingId);
        Task<bool> CheckAvailabilityUTCAsync(int WorkspaceUnitId, DateTime StartTimeUTC, DateTime EndTimeUTC, int? ExcludeBookingId = null);
    }
}
