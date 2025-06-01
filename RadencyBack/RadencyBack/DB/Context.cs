using Microsoft.EntityFrameworkCore;
using RadencyBack.Entities;
using System.Reflection;

namespace RadencyBack.NewFolder
{
    public class Context : DbContext
    {
        public Context(DbContextOptions<Context> options) : base(options)
        {
        }

        public DbSet<Coworking> Coworkings { get; set; }
        public DbSet<WorkspaceUnit> WorkspaceUnits { get; set; }
        public DbSet<OpenWorkspaceUnit> OpenWorkspaceUnits { get; set; }
        public DbSet<PrivateWorkspaceUnit> PrivateWorkspaceUnits { get; set; }
        public DbSet<MeetingWorkspaceUnit> MeetingWorkspaceUnits { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<UserBookingInfo> UserBookingInfos { get; set; }
        public DbSet<Amenity> Amenities { get; set; }
        public DbSet<WorkspaceAmenity> WorkspaceAmenities { get; set; }
        public DbSet<Photo> Photos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            modelBuilder.Entity<WorkspaceUnit>().HasDiscriminator<string>("WorkspaceType")
                .HasValue<OpenWorkspaceUnit>("Open")
                .HasValue<PrivateWorkspaceUnit>("Private")
                .HasValue<MeetingWorkspaceUnit>("Meeting");

            modelBuilder.Entity<WorkspaceAmenity>().HasKey(pav => new { pav.CoworkingId, pav.AmenityId });
            modelBuilder
                .Entity<WorkspaceAmenity>()
                .HasOne(wa => wa.Coworking)
                .WithMany(c => c.WorkspaceAmenities)
                .HasForeignKey(wa => wa.CoworkingId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder
                .Entity<WorkspaceAmenity>()
                .HasOne(wa => wa.Amenity)
                .WithMany(a => a.WorkspaceAmenities)
                .HasForeignKey(wa => wa.AmenityId)
                .OnDelete(DeleteBehavior.Cascade);

            // Ensure Booking DateTime properties are stored as UTC
            /*  modelBuilder.Entity<Booking>()
                  .Property(b => b.StartTimeLOC)
                  .HasConversion(q => q.Kind == DateTimeKind.Utc ? q : q.ToUniversalTime(), q => DateTime.SpecifyKind(q, DateTimeKind.Utc));

              modelBuilder.Entity<Booking>()
                  .Property(b => b.EndTimeLOC)
                  .HasConversion(q => q.Kind == DateTimeKind.Utc ? q : q.ToUniversalTime(), q => DateTime.SpecifyKind(q, DateTimeKind.Utc));
          */
        }


    }
}
