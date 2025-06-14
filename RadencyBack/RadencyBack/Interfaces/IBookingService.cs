using RadencyBack.DTO.AI;
using RadencyBack.DTO.booking;

namespace RadencyBack.Interfaces
{
    public interface IBookingService
    {
        Task<List<GetBookingDTO>> GetAllBookingsAsync();
        Task<GetBookingDTO?> GetBookingByIdAsync(int id);
        Task<GetBookingDTO> CreateBookingAsync(string Name, string Email, int WorkspaceUnitId, DateTime StartTimeLOC, DateTime EndTimeLOC, string TimeZoneId);
        Task<GetBookingDTO?> UpdateBookingAsync(int id, int WorkspaceUnitId, DateTime StartTimeLOC, DateTime EndTimeLOC, string TimeZoneId);
        Task<bool> DeleteBookingAsync(int id);
        Task<List<BookingAIRequestDTO>> GetUserBookingsAiRequestAsync();

    }
}
