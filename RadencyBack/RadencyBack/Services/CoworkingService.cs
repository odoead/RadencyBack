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

            var utcNow = DateTime.UtcNow;

            var workspaceTypes = new List<WorkspacesByTypeDTO>();
            var groupedWorkspaces = coworking.Workspaces.GroupBy((w) =>
            {
                var typeName = w.GetType().Name;
                return typeName.Replace("Unit", "");
            });

            foreach (var group in groupedWorkspaces)
            {
                var units = new List<BookableWorkspaceUnitDTO>();
                foreach (var g in group)
                {
                    var isAvailable = await IsAvailableInUtcAsync(g.Id, utcNow, utcNow);
                    units.Add(new BookableWorkspaceUnitDTO
                    {
                        Id = g.Id,
                        Capacity = GetWorkspaceCapacity(g),
                        IsAvailable = isAvailable,
                        HasCurrentBooking = g.Bookings.Any(b => b.StartTimeUTC <= utcNow && b.EndTimeUTC > utcNow),
                    });
                }
                workspaceTypes.Add(new WorkspacesByTypeDTO
                {
                    Type = group.Key,
                    Units = units
                });
            }

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




        public async Task<bool> IsAvailableInUtcAsync(int workspaceUnitId, DateTime startTimeUTC, DateTime endTimeUTC, int? excludeBookingId = null)
        {
            var workspace = await dbcontext.WorkspaceUnits
                .FirstOrDefaultAsync(w => w.Id == workspaceUnitId) ?? throw new BadRequestException("Workspace doesn't exist");

            int maxCapacity = GetWorkspaceCapacity(workspace);

            int overlappingBookings = await GetOverlappingBookingsCountAsync(workspaceUnitId, startTimeUTC, endTimeUTC, excludeBookingId);

            return overlappingBookings < maxCapacity;
        }

        public async Task<bool> IsAvailableInLOCAsync(int workspaceUnitId, DateTime startTimeLOC, DateTime endTimeLOC, int? excludeBookingId = null)
        {
            //check if workspace unit exists
            var workspaceExists = await dbcontext.WorkspaceUnits.AnyAsync(w => w.Id == workspaceUnitId);
            if (!workspaceExists)
                throw new NotFoundException($"WorkspaceUnit with id {workspaceUnitId} not found.");

            // check if there has been ever a booking for this workspace unit
            var timeZoneId = await dbcontext.Bookings
                .Where(b => b.WorkspaceUnitId == workspaceUnitId)
                .Select(b => b.TimeZoneId)
                .FirstOrDefaultAsync();
            if (string.IsNullOrEmpty(timeZoneId))
            {
                return true; // No bookings found, so it's mustbe available
            }

            var startTimeUTC = TimezoneConverter.GetUtcFromLocal(startTimeLOC, timeZoneId);
            var endTimeUTC = TimezoneConverter.GetUtcFromLocal(endTimeLOC, timeZoneId);

            return await IsAvailableInUtcAsync(workspaceUnitId, startTimeUTC, endTimeUTC, excludeBookingId);
        }

        private async Task<int> GetOverlappingBookingsCountAsync(int workspaceUnitId, DateTime startTimeUTC, DateTime endTimeUTC, int? excludeBookingId = null)
        {
            return await dbcontext.Bookings
                .Where(b => b.WorkspaceUnitId == workspaceUnitId && b.StartTimeUTC < endTimeUTC && b.EndTimeUTC > startTimeUTC
                    && (excludeBookingId == null || b.Id != excludeBookingId))
                .CountAsync();
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

        // Returns a list of already booked time ranges for a specific workspace unit in local time, filtered by a given period (optional)
        public async Task<GetUnavailableWorkspaceUnitLOCRangesDTO> GetUnavailableWorkspaceUnitLOCRangesAsync(
            int workspaceUnitId,
            int? excludeBookingId = null,
            DateTime? periodStartUTC = null,
            DateTime? periodEndUTC = null)
        {
            var workspaceExists = await dbcontext.WorkspaceUnits.AnyAsync(w => w.Id == workspaceUnitId);
            if (!workspaceExists)
                throw new NotFoundException($"WorkspaceUnit with id {workspaceUnitId} not found.");

            var query = dbcontext.Bookings
                .Where(b => b.WorkspaceUnitId == workspaceUnitId);

            if (excludeBookingId.HasValue)
                query = query.Where(b => b.Id != excludeBookingId.Value);

            // Only include bookings that overlap with the given period (if provided)
            if (periodStartUTC.HasValue && periodEndUTC.HasValue)
            {
                query = query.Where(b => b.StartTimeUTC < periodEndUTC.Value && b.EndTimeUTC > periodStartUTC.Value);
            }
            else
            {
                var utcNow = DateTime.UtcNow;
                query = query.Where(b => b.EndTimeUTC > utcNow);
            }

            var bookings = await query.OrderBy(b => b.StartTimeUTC).ToListAsync();

            var dateRanges = bookings.Select(booking => new DateTimeRangeDTO
            {
                Start = booking.StartTimeOffset.LocalDateTime,
                End = booking.EndTimeOffset.LocalDateTime,
            }).ToList();

            return new GetUnavailableWorkspaceUnitLOCRangesDTO
            {
                WorkspaceUnitId = workspaceUnitId,
                UnavailableRanges = dateRanges,
            };
        }

        public async Task<List<GetCoworkingMinDTO>> GetAllCoworkingsDetailsAsync()
        {
            return await dbcontext.Coworkings
                .Select(q => new GetCoworkingMinDTO
                {
                    Id = q.Id,
                    Name = q.Name,
                    Address = q.Address,
                    FirstPhotoUrl = q.Photos.Select(p => p.Url).FirstOrDefault() ?? string.Empty,
                    TotalCoworkingCapacity = q.Workspaces.OfType<OpenWorkspaceUnit>().Sum(w => w.MaxCapacity) + q.Workspaces.OfType<PrivateWorkspaceUnit>().Sum(w => w.MaxCapacity) + q.Workspaces.OfType<MeetingWorkspaceUnit>().Sum(w => w.MaxCapacity),
                    TotalWorkspaceUnitCount = q.Workspaces.Count,
                    OpenWorkspaceUnitCount = q.Workspaces.OfType<OpenWorkspaceUnit>().Count(),
                    PrivateWorkspaceUnitCount = q.Workspaces.OfType<PrivateWorkspaceUnit>().Count(),
                    MeetingWorkspaceUnitCount = q.Workspaces.OfType<MeetingWorkspaceUnit>().Count(),
                })
                .ToListAsync();
        }
    }
}
