using System.ComponentModel.DataAnnotations;

namespace RadencyBack.Entities
{
    public class UserBookingInfo
    {
        [Key]
        public int Id { get; set; }

        public string Email { get; set; }
        [Required]
        public string Name { get; set; }
        public ICollection<Booking> Bookings { get; set; }

    }
}
