using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RadencyBack.Entities
{
    public class Amenity
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Icon { get; set; }
        public ICollection<WorkspaceAmenity> WorkspaceAmenities { get; set; }
    }

    public class WorkspaceAmenity
    {

        [ForeignKey("CoworkingId")]
        public Coworking Coworking { get; set; }
        public int CoworkingId { get; set; }

        [ForeignKey("AmenityId")]
        public Amenity Amenity { get; set; }
        public int AmenityId { get; set; }

    }
}
