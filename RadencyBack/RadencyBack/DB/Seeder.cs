using Microsoft.EntityFrameworkCore;
using RadencyBack.Entities;
using RadencyBack.NewFolder;

namespace RadencyBack.DB
{
    public static class Seeder
    {
        public static async Task SeedDataAsync(Context dbcontext)
        {
            await dbcontext.Database.EnsureCreatedAsync();

            // Seed Coworkings
            if (!await dbcontext.Coworkings.AnyAsync())
            {
                dbcontext.Coworkings.AddRange(
                    new Coworking { Id = 1, Name = "Central Hub", Address = "100 Main St" },
                    new Coworking { Id = 2, Name = "Tech Space", Address = "200 Tech Ave" }
                );
            }

            // Seed Amenities
            if (!await dbcontext.Amenities.AnyAsync())
            {
                dbcontext.Amenities.AddRange(
                    new Amenity { Id = 1, Name = "WiFi", Icon = "wifi" },
                    new Amenity { Id = 2, Name = "Coffee", Icon = "coffee" },
                    new Amenity { Id = 3, Name = "Printer", Icon = "printer" }
                );
            }

            // Seed Photos
            if (!await dbcontext.Photos.AnyAsync())
            {
                dbcontext.Photos.AddRange(
                    new Photo { Id = 1, Url = "https://example.com/photo1.jpg", CoworkingId = 1 },
                    new Photo { Id = 2, Url = "https://example.com/photo2.jpg", CoworkingId = 2 }
                );
            }

            // Seed OpenWorkspaceUnits
            if (!await dbcontext.OpenWorkspaceUnits.AnyAsync())
            {
                dbcontext.OpenWorkspaceUnits.AddRange(
                    new OpenWorkspaceUnit { Id = 1, CoworkingId = 1, MaxCapacity = 60 }
                );
            }

            // Seed PrivateWorkspaceUnits
            if (!await dbcontext.PrivateWorkspaceUnits.AnyAsync())
            {
                dbcontext.PrivateWorkspaceUnits.AddRange(
                    new PrivateWorkspaceUnit { Id = 2, CoworkingId = 1, MaxCapacity = 2 },
                    new PrivateWorkspaceUnit { Id = 3, CoworkingId = 2, MaxCapacity = 5 }
                );
            }

            // Seed MeetingWorkspaceUnits
            if (!await dbcontext.MeetingWorkspaceUnits.AnyAsync())
            {
                dbcontext.MeetingWorkspaceUnits.AddRange(
                    new MeetingWorkspaceUnit { Id = 4, CoworkingId = 2, MaxCapacity = 10 },
                    new MeetingWorkspaceUnit { Id = 5, CoworkingId = 1, MaxCapacity = 10 }
                );
            }

            // Seed UserBookingInfos
            if (!await dbcontext.UserBookingInfos.AnyAsync())
            {
                dbcontext.UserBookingInfos.AddRange(
                    new UserBookingInfo { Id = 1, Email = "alice@example.com", Name = "Alice" },
                    new UserBookingInfo { Id = 2, Email = "bob@example.com", Name = "Bob" }
                );
            }

            // Seed Bookings
            // Seed Bookings
            if (!await dbcontext.Bookings.AnyAsync())
            {
                dbcontext.Bookings.AddRange(
                    new Booking
                    {
                        Id = 1,
                        WorkspaceUnitId = 1,
                        StartTimeUTC = new DateTime(2025, 6, 1, 9, 0, 0, DateTimeKind.Utc),
                        EndTimeUTC = new DateTime(2025, 6, 1, 17, 0, 0, DateTimeKind.Utc),
                        TimeZoneId = "Europe/Berlin",
                        UserInfoId = 1,
                    },
                    new Booking
                    {
                        Id = 2,
                        WorkspaceUnitId = 2,
                        StartTimeUTC = new DateTime(2025, 6, 2, 10, 0, 0, DateTimeKind.Utc),
                        EndTimeUTC = new DateTime(2025, 6, 2, 12, 0, 0, DateTimeKind.Utc),
                        TimeZoneId = "Europe/Berlin",
                        UserInfoId = 2
                    }
                );
            }

            // Seed WorkspaceAmenities
            if (!await dbcontext.WorkspaceAmenities.AnyAsync())
            {
                dbcontext.WorkspaceAmenities.AddRange(
                    new WorkspaceAmenity { CoworkingId = 1, AmenityId = 1 },
                    new WorkspaceAmenity { CoworkingId = 1, AmenityId = 2 },
                    new WorkspaceAmenity { CoworkingId = 2, AmenityId = 1 },
                    new WorkspaceAmenity { CoworkingId = 2, AmenityId = 3 }
                );
            }

            await dbcontext.SaveChangesAsync();
        }
    }
}
