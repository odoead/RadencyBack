using Microsoft.EntityFrameworkCore;
using RadencyBack.DTO;
using RadencyBack.DTO.coworking;
using RadencyBack.Entities;
using RadencyBack.Exceptions;
using RadencyBack.Interfaces;
using RadencyBack.NewFolder;

namespace RadencyBack.Services
{
    public class CoworkingService : ICoworkingService
    {
        private readonly Context dbcontext;

        public CoworkingService(Context context)
        {
            dbcontext = context;
        }

        public async Task<GetCoworkingDetailsDTO?> GetCoworkingDetailsAsync(int coworkingId)
        {
            var coworking = await dbcontext.Coworkings.Include(c => c.Workspaces).ThenInclude(w => w.Bookings)
                .Include(c => c.WorkspaceAmenities).ThenInclude(wa => wa.Amenity)
                .Include(c => c.Photos).FirstOrDefaultAsync(c => c.Id == coworkingId) ??
                throw new NotFoundException($"Coworking with id {coworkingId} not found.");

            if (coworking == null) return null;

            var UTCnow = DateTime.UtcNow;
            var workspaceTypes = coworking.Workspaces.GroupBy(w => w.GetType().Name.ToLower())
                .Select(g => new WorkspacesByTypeDTO
                {
                    Type = g.Key,
                    Units = g.Select(w => new BookableWorkspaceUnitDTO
                    {
                        Id = w.Id,
                        Capacity = GetWorkspaceCapacity(w),
                        IsAvailable = !w.Bookings.Any(b => b.StartTimeUTC <= UTCnow && b.EndTimeUTC > UTCnow),
                        HasCurrentBooking = w.Bookings.Any(b => b.StartTimeUTC <= UTCnow && b.EndTimeUTC > UTCnow),
                    }).ToList(),
                }).ToList();

            return new GetCoworkingDetailsDTO
            {
                Id = coworking.Id,
                Name = coworking.Name,
                Address = coworking.Address,
                WorkspaceTypes = workspaceTypes,
                Amenities = coworking.WorkspaceAmenities.Select(wa => new AmenityDTO
                {
                    Id = wa.Amenity.Id,
                    Name = wa.Amenity.Name,
                    Icon = wa.Amenity.Icon,
                }).ToList(),
                PhotoUrls = coworking.Photos.Select(p => p.Url).ToList(),
            };
        }




        public async Task<bool> CheckAvailabilityUTCAsync(int workspaceUnitId, DateTime startTimeUTC, DateTime endTimeUTC, int? excludeBookingId)
        {
            return !await dbcontext.Bookings
                .Where(b => b.WorkspaceUnitId == workspaceUnitId && b.StartTimeUTC < endTimeUTC && b.EndTimeUTC > startTimeUTC)
                .Where(b => (excludeBookingId == null || b.Id != excludeBookingId))
                .AnyAsync();

        }

        public async Task<bool> CheckAvailabilityLOCAsync(int workspaceUnitId, DateTime startTimeLOC, DateTime endTimeLOC, int? excludeBookingId)
        {
            var timeZoneId = await dbcontext.Bookings
                .Where(b => b.WorkspaceUnitId == workspaceUnitId)
                .Select(b => b.TimeZoneId)
                .FirstOrDefaultAsync() ?? throw new BadRequestException("Workspace doesn't exist");

            var startTimeUTC = TimezoneConverter.GetUtcFromLocal(startTimeLOC, timeZoneId);
            var endTimeUTC = TimezoneConverter.GetUtcFromLocal(endTimeLOC, timeZoneId);

            return await CheckAvailabilityUTCAsync(workspaceUnitId, startTimeUTC, endTimeUTC, excludeBookingId);
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

        // Returns a list of already booked time ranges for a specific workspace unit in local time
        public async Task<GetUnavailableWorkspaceUnitLOCRangesDTO> GetUnavailableWorkspaceUnitLOCRangesAsync(int workspaceUnitId, int? excludeBookingId = null)
        {
            var workspaceExists = await dbcontext.WorkspaceUnits.AnyAsync(w => w.Id == workspaceUnitId);
            if (!workspaceExists)
                throw new NotFoundException($"WorkspaceUnit with id {workspaceUnitId} not found.");


            var utcNow = DateTime.UtcNow;
            var bookings = await dbcontext.Bookings
                .Where(b => b.WorkspaceUnitId == workspaceUnitId)
                .Where(q => q.EndTimeUTC > utcNow)
                .Where(b => (excludeBookingId == null || b.Id != excludeBookingId.Value))
                .OrderBy(b => b.StartTimeUTC)
                .ToListAsync();
            if (bookings.Any() == false)
            {
                return new GetUnavailableWorkspaceUnitLOCRangesDTO
                {
                    WorkspaceUnitId = workspaceUnitId,

                    UnavailableRanges = new List<DateTimeRangeDTO>(),
                };
            }


            var dateRanges = new List<DateTimeRangeDTO>();
            foreach (var booking in bookings)
            {
                dateRanges.Add(new DateTimeRangeDTO
                {
                    Start = booking.StartTimeOffset.LocalDateTime,
                    End = booking.EndTimeOffset.LocalDateTime,
                });
            }
            return new GetUnavailableWorkspaceUnitLOCRangesDTO
            {
                UnavailableRanges = dateRanges,
                WorkspaceUnitId = workspaceUnitId,
            };
        }

    }
}
