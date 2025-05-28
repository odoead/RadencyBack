using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RadencyBack.Entities
{
    public class Photo
    {
        [Key]
        public int Id { get; set; }
        public string Url { get; set; }

        [ForeignKey("CoworkingId")]
        public Coworking Coworking { get; set; }
        public int CoworkingId { get; set; }

    }
}
