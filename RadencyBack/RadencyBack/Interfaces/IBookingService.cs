using RadencyBack.DTO.booking;

namespace RadencyBack.Interfaces
{
    public interface IBookingService
    {
        Task<List<BookingDTO>> GetAllBookingsAsync();
        Task<BookingDTO?> GetBookingByIdAsync(int id);
        Task<BookingDTO> CreateBookingAsync(string Name, string Email, int WorkspaceUnitId, DateTime StartTimeUTC, DateTime EndTimeUTC);
        Task<BookingDTO?> UpdateBookingAsync(int id, int WorkspaceUnitId, DateTime StartTimeUTC, DateTime EndTimeUTC);
        Task<bool> DeleteBookingAsync(int id);

    }
}
