using Microsoft.EntityFrameworkCore;
using RadencyBack.Entities;

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

            modelBuilder.Entity<WorkspaceUnit>().HasDiscriminator<string>("WorkspaceType")
               .HasValue<OpenWorkspaceUnit>("Open")
               .HasValue<PrivateWorkspaceUnit>("Private")
               .HasValue<MeetingWorkspaceUnit>("Meeting");

            //seeddata
        }
    }
}
