using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RadencyBack.Entities
{
    public abstract class WorkspaceUnit
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("CoworkingId")]
        public Coworking Coworking { get; set; }
        public int CoworkingId { get; set; }

        public ICollection<Booking> Bookings { get; set; }

    }

    public class OpenWorkspaceUnit : WorkspaceUnit
    {
        public int MaxCapacity { get; set; }

    }

    public class PrivateWorkspaceUnit : WorkspaceUnit
    {
        public int MaxCapacity { get; set; }
    }

    public class MeetingWorkspaceUnit : WorkspaceUnit
    {
        public int MaxCapacity { get; set; }
    }
}
