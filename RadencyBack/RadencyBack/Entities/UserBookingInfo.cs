using System.ComponentModel.DataAnnotations;

namespace RadencyBack.Entities
{
    public class UserBookingInfo
    {
        [Key]
        public int Id { get; set; }

        public string Email { get; set; }
        public string Name { get; set; }
    }
}
