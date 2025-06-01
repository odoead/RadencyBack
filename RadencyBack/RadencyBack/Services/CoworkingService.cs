using Microsoft.EntityFrameworkCore;
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

        public async Task<CoworkingDetailsDTO?> GetCoworkingDetailsAsync(int coworkingId)
        {
            var coworking = await dbcontext.Coworkings.Include(c => c.Workspaces).ThenInclude(w => w.Bookings)
                .Include(c => c.WorkspaceAmenities).ThenInclude(wa => wa.Amenity)
                .Include(c => c.Photos).FirstOrDefaultAsync(c => c.Id == coworkingId);

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

            return new CoworkingDetailsDTO
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
                .Where(b => b.WorkspaceUnitId == workspaceUnitId &&
                            b.StartTimeUTC < endTimeUTC &&
                            b.EndTimeUTC > startTimeUTC &&
                            (excludeBookingId == null || b.Id != excludeBookingId))
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
    }
}
