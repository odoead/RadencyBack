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

            // IDs configuration
            modelBuilder.Entity<Amenity>(entity =>
            {
                entity.Property(e => e.Id)
                      .UseIdentityByDefaultColumn();
            });

            modelBuilder.Entity<Booking>(entity =>
            {
                entity.Property(e => e.Id)
                      .UseIdentityByDefaultColumn();
            });

            modelBuilder.Entity<Coworking>(entity =>
            {
                entity.Property(e => e.Id)
                      .UseIdentityByDefaultColumn();
            });

            modelBuilder.Entity<Photo>(entity =>
            {
                entity.Property(e => e.Id)
                      .UseIdentityByDefaultColumn();
            });

            modelBuilder.Entity<UserBookingInfo>(entity =>
            {
                entity.Property(e => e.Id)
                      .UseIdentityByDefaultColumn();
            });

            modelBuilder.Entity<WorkspaceUnit>(entity =>
            {
                entity.Property(e => e.Id)
                      .UseIdentityByDefaultColumn();
            });

            // WorkspaceUnit - Discriminator: Use a discriminator column to differentiate between workspace types
            modelBuilder.Entity<WorkspaceUnit>().HasDiscriminator<string>("WorkspaceType")
                .HasValue<OpenWorkspaceUnit>("Open")
                .HasValue<PrivateWorkspaceUnit>("Private")
                .HasValue<MeetingWorkspaceUnit>("Meeting");

            // Coworking - WorkspaceAmenity: Delete WorkspaceAmenities on Coworking delete, do NOT delete Coworking on WorkspaceAmenity delete
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

            // Coworking - WorkspaceUnit: Delete WorkspaceUnits on Coworking delete, do NOT delete Coworking on WorkspaceUnit delete
            modelBuilder.Entity<WorkspaceUnit>()
                .HasOne(w => w.Coworking)
                .WithMany(c => c.Workspaces)
                .HasForeignKey(w => w.CoworkingId)
                .OnDelete(DeleteBehavior.Cascade);

            // WorkspaceUnit - Booking: Do NOT delete WorkspaceUnit on Booking delete, do NOT delete Booking on WorkspaceUnit delete
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.WorkspaceUnit)
                .WithMany(w => w.Bookings)
                .HasForeignKey(b => b.WorkspaceUnitId)
                .OnDelete(DeleteBehavior.Restrict);

            // UserBookingInfo - Booking: Delete Bookings on UserBookingInfo delete, do NOT delete UserBookingInfo on Booking delete
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.UserInfo)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserInfoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Coworking - Photo: Delete Photo on Coworking delete, do NOT delete Coworking on Photo delete
            modelBuilder.Entity<Photo>()
                .HasOne(p => p.Coworking)
                .WithMany(c => c.Photos)
                .HasForeignKey(p => p.CoworkingId)
                .OnDelete(DeleteBehavior.Cascade);

            // WorkspaceAmenity: Do NOT delete Amenity on Workspace delete, do NOT delete Workspace on Amenity delete
            modelBuilder.Entity<WorkspaceAmenity>()
                .HasOne(wa => wa.Coworking)
                .WithMany(c => c.WorkspaceAmenities)
                .HasForeignKey(wa => wa.CoworkingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<WorkspaceAmenity>()
                .HasOne(wa => wa.Amenity)
                .WithMany(a => a.WorkspaceAmenities)
                .HasForeignKey(wa => wa.AmenityId)
                .OnDelete(DeleteBehavior.Restrict);
        }


    }
}
