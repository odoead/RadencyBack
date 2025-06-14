using RadencyBack.DTO.coworking;

namespace RadencyBack.Interfaces
{
    public interface ICoworkingService
    {
        Task<GetCoworkingDetailsDTO?> GetCoworkingDetailsAsync(int coworkingId);

        Task<List<GetCoworkingMinDTO>> GetAllCoworkingsDetailsAsync();
        Task<bool> IsAvailableInLOCAsync(int workspaceUnitId, DateTime startTimeLOC, DateTime endTimeLOC, int? excludeBookingId);
        Task<bool> IsAvailableInUtcAsync(int WorkspaceUnitId, DateTime StartTimeUTC, DateTime EndTimeUTC, int? ExcludeBookingId = null);
        Task<GetUnavailableWorkspaceUnitLOCRangesDTO> GetUnavailableWorkspaceUnitLOCRangesAsync(int workspaceUnitId, int? excludeBookingId, DateTime? periodStartUTC = null, DateTime? periodEndUTC = null);
    }
}
