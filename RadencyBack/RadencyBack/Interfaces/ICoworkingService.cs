using RadencyBack.DTO.coworking;

namespace RadencyBack.Interfaces
{
    public interface ICoworkingService
    {
        Task<CoworkingDetailsDTO?> GetCoworkingDetailsAsync(int coworkingId);
        Task<bool> CheckAvailabilityAsync(int WorkspaceUnitId, DateTime StartTimeUTC, DateTime EndTimeUTC, int? ExcludeBookingId = null);
    }
}
