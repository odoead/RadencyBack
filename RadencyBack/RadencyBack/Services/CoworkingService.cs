using Microsoft.EntityFrameworkCore;
using RadencyBack.DTO.coworking;
using RadencyBack.Entities;
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




        public async Task<bool> CheckAvailabilityAsync(int WorkspaceUnitId, DateTime StartTimeUTC, DateTime EndTimeUTC, int? ExcludeBookingId)
        {
            var conflictingBookings = await dbcontext.Bookings
                .Where(b => b.WorkspaceUnitId == WorkspaceUnitId && b.StartTimeUTC < EndTimeUTC && b.EndTimeUTC > StartTimeUTC)
                .Where(b => ExcludeBookingId == null || b.Id != ExcludeBookingId)
                .AnyAsync();

            return !conflictingBookings;
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
