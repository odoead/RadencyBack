using System.ComponentModel.DataAnnotations;

namespace RadencyBack.Entities
{
    public class Coworking
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }

        public ICollection<WorkspaceUnit> Workspaces { get; set; }
        public ICollection<Photo> Photos { get; set; }
        public ICollection<WorkspaceAmenity> WorkspaceAmenities { get; set; }
    }
}
