using Microsoft.EntityFrameworkCore;
using RadencyBack.DTO.booking;
using RadencyBack.Entities;
using RadencyBack.Exceptions;
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

        public async Task<List<GetBookingDTO>> GetAllBookingsAsync()
        {
            var bookings = await dbcontext.Bookings.Include(b => b.UserInfo)
                 .Include(b => b.WorkspaceUnit).ThenInclude(w => w.Coworking).ToListAsync();

            return bookings.Select(b => new GetBookingDTO
            {
                Id = b.Id,
                UserName = b.UserInfo.Name,
                UserEmail = b.UserInfo.Email,
                WorkspaceUnitId = b.WorkspaceUnitId,
                WorkspaceType = GetWorkspaceTypeName(b.WorkspaceUnit),
                WorkspaceCapacity = GetWorkspaceCapacity(b.WorkspaceUnit),
                CoworkingName = b.WorkspaceUnit.Coworking.Name,
                StartTimeLOC = TimezoneConverter.GetLocalFromUtc(b.StartTimeUTC, b.TimeZoneId),
                EndTimeLOC = TimezoneConverter.GetLocalFromUtc(b.EndTimeUTC, b.TimeZoneId),
                TimeZoneId = b.TimeZoneId,
            }).ToList();
        }

        public async Task<GetBookingDTO?> GetBookingByIdAsync(int id)
        {
            var booking = await dbcontext.Bookings.Include(b => b.UserInfo)
                .Include(b => b.WorkspaceUnit).ThenInclude(w => w.Coworking).Where(b => b.Id == id).ToListAsync();
            if (booking.Count == 0)
                throw new NotFoundException($"Booking with id {id} not found.");

            return booking.Select(b => new GetBookingDTO
            {
                Id = b.Id,
                UserName = b.UserInfo.Name,
                UserEmail = b.UserInfo.Email,
                WorkspaceUnitId = b.WorkspaceUnitId,
                WorkspaceType = GetWorkspaceTypeName(b.WorkspaceUnit),
                WorkspaceCapacity = GetWorkspaceCapacity(b.WorkspaceUnit),
                CoworkingName = b.WorkspaceUnit.Coworking.Name,
                StartTimeLOC = TimezoneConverter.GetLocalFromUtc(b.StartTimeUTC, b.TimeZoneId),
                EndTimeLOC = TimezoneConverter.GetLocalFromUtc(b.EndTimeUTC, b.TimeZoneId),
                TimeZoneId = b.TimeZoneId,
            }).FirstOrDefault();
        }

        public async Task<GetBookingDTO> CreateBookingAsync(string Name, string Email, int WorkspaceUnitId, DateTime StartTimeLOC, DateTime EndTimeLOC, string TimeZoneId)
        {
            var StartTimeUTC = TimezoneConverter.GetUtcFromLocal(StartTimeLOC, TimeZoneId);
            var EndTimeUTC = TimezoneConverter.GetUtcFromLocal(EndTimeLOC, TimeZoneId);
            var doesCoworkingAvailable = await coworkingService.CheckAvailabilityUTCAsync(WorkspaceUnitId, StartTimeUTC, EndTimeUTC, null);
            if (!doesCoworkingAvailable)
            {
                throw new BadRequestException("Selected time is not available. Please choose a different slot.");
            }

            var userInfo = await dbcontext.UserBookingInfos.FirstOrDefaultAsync(u => u.Email == Email);
            if (userInfo == null)
            {
                userInfo = new UserBookingInfo
                {
                    Name = Name,
                    Email = Email,
                };
                dbcontext.UserBookingInfos.Add(userInfo);
                await dbcontext.SaveChangesAsync();
            }

            var booking = new Booking
            {
                WorkspaceUnitId = WorkspaceUnitId,
                StartTimeUTC = StartTimeUTC,
                EndTimeUTC = EndTimeUTC,
                UserInfoId = userInfo.Id,
                TimeZoneId = TimeZoneId,
            };

            dbcontext.Bookings.Add(booking);
            await dbcontext.SaveChangesAsync();
            return await GetBookingByIdAsync(booking.Id);
        }

        public async Task<GetBookingDTO?> UpdateBookingAsync(int id, int WorkspaceUnitId, DateTime StartTimeLOC, DateTime EndTimeLOC, string TimeZoneId)
        {
            var booking = await dbcontext.Bookings.FindAsync(id) ??
                throw new NotFoundException($"Booking with id {id} not found.");



            var StartTimeUTC = TimezoneConverter.GetUtcFromLocal(StartTimeLOC, TimeZoneId);
            var EndTimeUTC = TimezoneConverter.GetUtcFromLocal(EndTimeLOC, TimeZoneId);
            var doesCoworkingAvailable = await coworkingService.CheckAvailabilityUTCAsync(WorkspaceUnitId, StartTimeUTC, EndTimeUTC, id);
            if (!doesCoworkingAvailable)
            {
                throw new BadRequestException("Selected time is not available. Please choose a different slot.");
            }

            booking.WorkspaceUnitId = WorkspaceUnitId;
            booking.StartTimeUTC = StartTimeUTC;
            booking.EndTimeUTC = EndTimeUTC;
            booking.TimeZoneId = TimeZoneId;

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

