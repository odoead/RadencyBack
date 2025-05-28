using Microsoft.EntityFrameworkCore;
using RadencyBack.DTO.booking;
using RadencyBack.Entities;
using RadencyBack.Interfaces;
using RadencyBack.NewFolder;

namespace RadencyBack.Services
{
    public class BookingService : IBookingService
    {
        private readonly Context dbcontext;
        private readonly ICoworkingService coworkingService;

        public BookingService(Context context, ICoworkingService coworkingService)
        {
            dbcontext = context;
            this.coworkingService = coworkingService;
        }

        public async Task<List<BookingDTO>> GetAllBookingsAsync()
        {
            var bookings = await dbcontext.Bookings.Include(b => b.UserInfo)
                 .Include(b => b.WorkspaceUnit).ThenInclude(w => w.Coworking).ToListAsync();

            return bookings.Select(b => new BookingDTO
            {
                Id = b.Id,
                UserName = b.UserInfo.Name,
                UserEmail = b.UserInfo.Email,
                WorkspaceUnitId = b.WorkspaceUnitId,
                WorkspaceType = GetWorkspaceTypeName(b.WorkspaceUnit),
                WorkspaceCapacity = GetWorkspaceCapacity(b.WorkspaceUnit),
                CoworkingName = b.WorkspaceUnit.Coworking.Name,
                StartTimeUTC = b.StartTimeUTC,
                EndTimeUTC = b.EndTimeUTC,
            }).ToList();
        }

        public async Task<BookingDTO?> GetBookingByIdAsync(int id)
        {
            var booking = await dbcontext.Bookings.Include(b => b.UserInfo)
                .Include(b => b.WorkspaceUnit).ThenInclude(w => w.Coworking).Where(b => b.Id == id).ToListAsync();

            return booking.Select(b => new BookingDTO
            {
                Id = b.Id,
                UserName = b.UserInfo.Name,
                UserEmail = b.UserInfo.Email,
                WorkspaceUnitId = b.WorkspaceUnitId,
                WorkspaceType = GetWorkspaceTypeName(b.WorkspaceUnit),
                WorkspaceCapacity = GetWorkspaceCapacity(b.WorkspaceUnit),
                CoworkingName = b.WorkspaceUnit.Coworking.Name,
                StartTimeUTC = b.StartTimeUTC,
                EndTimeUTC = b.EndTimeUTC,
            }).FirstOrDefault();
        }

        public async Task<BookingDTO> CreateBookingAsync(string Name, string Email, int WorkspaceUnitId, DateTime StartTimeUTC, DateTime EndTimeUTC)
        {
            var doesCoworkingAvailable = await coworkingService.CheckAvailabilityAsync(WorkspaceUnitId, StartTimeUTC, EndTimeUTC, null);
            if (!doesCoworkingAvailable)
            {
                throw new InvalidOperationException("Selected time is not available. Please choose a different slot.");
            }

            var userInfo = await dbcontext.UserBookingInfos.FirstOrDefaultAsync(u => u.Email == Email);
            if (userInfo == null)
            {
                userInfo = new UserBookingInfo
                {
                    Name = Name,
                    Email = Email
                };
                dbcontext.UserBookingInfos.Add(userInfo);
                await dbcontext.SaveChangesAsync();
            }

            var booking = new Booking
            {
                WorkspaceUnitId = WorkspaceUnitId,
                StartTimeUTC = StartTimeUTC,
                EndTimeUTC = EndTimeUTC,
                UserInfoId = userInfo.Id
            };

            dbcontext.Bookings.Add(booking);
            await dbcontext.SaveChangesAsync();
            return await GetBookingByIdAsync(booking.Id);
        }

        public async Task<BookingDTO?> UpdateBookingAsync(int id, int WorkspaceUnitId, DateTime StartTimeUTC, DateTime EndTimeUTC)
        {
            var booking = await dbcontext.Bookings.FindAsync(id);
            if (booking == null) return null;

            var doesCoworkingAvailable = await coworkingService.CheckAvailabilityAsync(WorkspaceUnitId, StartTimeUTC, EndTimeUTC, id);
            if (!doesCoworkingAvailable)
            {
                throw new InvalidOperationException("Selected time is not available. Please choose a different slot.");
            }

            booking.WorkspaceUnitId = WorkspaceUnitId;
            booking.StartTimeUTC = StartTimeUTC;
            booking.EndTimeUTC = EndTimeUTC;

            await dbcontext.SaveChangesAsync();
            return await GetBookingByIdAsync(id);
        }

        public async Task<bool> DeleteBookingAsync(int id)
        {
            var booking = await dbcontext.Bookings.FindAsync(id);
            if (booking == null) return false;

            dbcontext.Bookings.Remove(booking);
            await dbcontext.SaveChangesAsync();
            return true;
        }

        private static string GetWorkspaceTypeName(WorkspaceUnit workspace)
        {
            return workspace switch
            {
                OpenWorkspaceUnit => "Open Space",
                PrivateWorkspaceUnit => "Private Room",
                MeetingWorkspaceUnit => "Meeting Room",
                _ => "Unknown"
            };
        }

        private static int GetWorkspaceCapacity(WorkspaceUnit workspace)
        {
            return workspace switch
            {
                OpenWorkspaceUnit open => open.MaxCapacity,
                PrivateWorkspaceUnit priv => priv.MaxCapacity,
                MeetingWorkspaceUnit meeting => meeting.MaxCapacity,
                _ => 0
            };
        }
    }
}

