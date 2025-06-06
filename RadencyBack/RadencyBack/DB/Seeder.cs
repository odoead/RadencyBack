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

            // --- Seed Coworkings ---
            if (!await dbcontext.Coworkings.AnyAsync())
            {
                var coworking1 = new Coworking { Name = "Central Hub", Address = "100 Main St" };
                var coworking2 = new Coworking { Name = "Tech Space", Address = "200 Tech Ave" };
                dbcontext.Coworkings.AddRange(coworking1, coworking2);
                await dbcontext.SaveChangesAsync();
            }

            // --- Seed Amenities ---
            if (!await dbcontext.Amenities.AnyAsync())
            {
                var amenity1 = new Amenity { Name = "WiFi", Icon = "wifi" };
                var amenity2 = new Amenity { Name = "Coffee", Icon = "coffee" };
                var amenity3 = new Amenity { Name = "Printer", Icon = "printer" };
                dbcontext.Amenities.AddRange(amenity1, amenity2, amenity3);
                await dbcontext.SaveChangesAsync();
            }

            // --- Seed Photos ---
            if (!await dbcontext.Photos.AnyAsync())
            {
                var centralHub = await dbcontext.Coworkings.FirstOrDefaultAsync(c => c.Name == "Central Hub");
                var techSpace = await dbcontext.Coworkings.FirstOrDefaultAsync(c => c.Name == "Tech Space");

                if (centralHub != null)
                {
                    dbcontext.Photos.Add(new Photo { Url = "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ", CoworkingId = centralHub.Id });
                }
                if (techSpace != null)
                {
                    dbcontext.Photos.Add(new Photo { Url = "https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ", CoworkingId = techSpace.Id });
                }
            }

            // --- Seed Workspace Units ---
            var coworkingForUnits1 = await dbcontext.Coworkings.FirstOrDefaultAsync(c => c.Name == "Central Hub");
            var coworkingForUnits2 = await dbcontext.Coworkings.FirstOrDefaultAsync(c => c.Name == "Tech Space");

            if (coworkingForUnits1 != null)
            {
                if (!await dbcontext.OpenWorkspaceUnits.AnyAsync())
                {
                    dbcontext.OpenWorkspaceUnits.Add(new OpenWorkspaceUnit { CoworkingId = coworkingForUnits1.Id, MaxCapacity = 60 });
                }
                if (!await dbcontext.PrivateWorkspaceUnits.AnyAsync(pwu => pwu.CoworkingId == coworkingForUnits1.Id))
                {
                    dbcontext.PrivateWorkspaceUnits.Add(new PrivateWorkspaceUnit { CoworkingId = coworkingForUnits1.Id, MaxCapacity = 2 });
                }
                if (!await dbcontext.MeetingWorkspaceUnits.AnyAsync(mwu => mwu.CoworkingId == coworkingForUnits1.Id))
                {
                    dbcontext.MeetingWorkspaceUnits.Add(new MeetingWorkspaceUnit { CoworkingId = coworkingForUnits1.Id, MaxCapacity = 10 });
                }
            }
            if (coworkingForUnits2 != null)
            {
                if (!await dbcontext.PrivateWorkspaceUnits.AnyAsync(pwu => pwu.CoworkingId == coworkingForUnits2.Id))
                {
                    dbcontext.PrivateWorkspaceUnits.Add(new PrivateWorkspaceUnit { CoworkingId = coworkingForUnits2.Id, MaxCapacity = 5 });
                }
                if (!await dbcontext.MeetingWorkspaceUnits.AnyAsync(mwu => mwu.CoworkingId == coworkingForUnits2.Id))
                {
                    dbcontext.MeetingWorkspaceUnits.Add(new MeetingWorkspaceUnit { CoworkingId = coworkingForUnits2.Id, MaxCapacity = 10 });
                }
            }

            // --- Seed UserBookingInfos ---
            UserBookingInfo alice = await dbcontext.UserBookingInfos.FirstOrDefaultAsync(u => u.Email == "alice@example.com");
            UserBookingInfo bob = await dbcontext.UserBookingInfos.FirstOrDefaultAsync(u => u.Email == "bob@example.com");

            if (alice == null)
            {
                alice = new UserBookingInfo { Email = "alice@example.com", Name = "Alice" };
                dbcontext.UserBookingInfos.Add(alice);
            }
            if (bob == null)
            {
                bob = new UserBookingInfo { Email = "bob@example.com", Name = "Bob" };
                dbcontext.UserBookingInfos.Add(bob);
            }

            if (dbcontext.ChangeTracker.HasChanges())
            {
                await dbcontext.SaveChangesAsync();
                // Reload alice and bob to ensure their IDs are set.
                if (await dbcontext.UserBookingInfos.FirstOrDefaultAsync(u => u.Email == "alice@example.com") != null && alice.Id == 0)
                    alice = await dbcontext.UserBookingInfos.FirstOrDefaultAsync(u => u.Email == "alice@example.com");
                if (await dbcontext.UserBookingInfos.FirstOrDefaultAsync(u => u.Email == "bob@example.com") != null && bob.Id == 0)
                    bob = await dbcontext.UserBookingInfos.FirstOrDefaultAsync(u => u.Email == "bob@example.com");
            }

            // --- Seed Bookings ---
            if (!await dbcontext.Bookings.AnyAsync())
            {
                // Ensure alice and bob exist and have IDs.
                if (alice != null && alice.Id != 0 && bob != null && bob.Id != 0)
                {
                    var workspaceUnit1 = await dbcontext.WorkspaceUnits.FindAsync(1);
                    var workspaceUnit2 = await dbcontext.WorkspaceUnits.FindAsync(2);

                    if (workspaceUnit1 != null && workspaceUnit2 != null)
                    {
                        dbcontext.Bookings.AddRange(
                            new Booking { WorkspaceUnitId = workspaceUnit1.Id, StartTimeUTC = new DateTime(2025, 6, 1, 9, 0, 0, DateTimeKind.Utc), EndTimeUTC = new DateTime(2025, 6, 1, 17, 0, 0, DateTimeKind.Utc), TimeZoneId = "Europe/Berlin", UserInfo = alice },
                            new Booking { WorkspaceUnitId = workspaceUnit2.Id, StartTimeUTC = new DateTime(2025, 6, 2, 10, 0, 0, DateTimeKind.Utc), EndTimeUTC = new DateTime(2025, 6, 2, 12, 0, 0, DateTimeKind.Utc), TimeZoneId = "Europe/Berlin", UserInfo = bob }
                        );
                    }
                    else
                    {
                        Console.WriteLine("Warning: WorkspaceUnit with ID 1 or 2 not found. Bookings not added.");
                    }
                }
                else
                {
                    Console.WriteLine("Warning: UserBookingInfo 'alice' or 'bob' not found or not created. Bookings not added.");
                }
            }

            // --- Seed WorkspaceAmenities ---
            if (!await dbcontext.WorkspaceAmenities.AnyAsync())
            {
                var centralHub = await dbcontext.Coworkings.FirstOrDefaultAsync(c => c.Name == "Central Hub");
                var techSpace = await dbcontext.Coworkings.FirstOrDefaultAsync(c => c.Name == "Tech Space");
                var wifi = await dbcontext.Amenities.FirstOrDefaultAsync(a => a.Name == "WiFi");
                var coffee = await dbcontext.Amenities.FirstOrDefaultAsync(a => a.Name == "Coffee");
                var printer = await dbcontext.Amenities.FirstOrDefaultAsync(a => a.Name == "Printer");

                if (centralHub != null && wifi != null)
                    dbcontext.WorkspaceAmenities.Add(new WorkspaceAmenity { CoworkingId = centralHub.Id, AmenityId = wifi.Id });
                if (centralHub != null && coffee != null)
                    dbcontext.WorkspaceAmenities.Add(new WorkspaceAmenity { CoworkingId = centralHub.Id, AmenityId = coffee.Id });
                if (techSpace != null && wifi != null)
                    dbcontext.WorkspaceAmenities.Add(new WorkspaceAmenity { CoworkingId = techSpace.Id, AmenityId = wifi.Id });
                if (techSpace != null && printer != null)
                    dbcontext.WorkspaceAmenities.Add(new WorkspaceAmenity { CoworkingId = techSpace.Id, AmenityId = printer.Id });
            }

            // Final save for any remaining changes.
            if (dbcontext.ChangeTracker.HasChanges())
            {
                await dbcontext.SaveChangesAsync();
            }
        }

    }
}

