using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RadencyBack.Entities
{
    public class Booking
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("WorkspaceUnitId")]
        public WorkspaceUnit WorkspaceUnit { get; set; }
        public int WorkspaceUnitId { get; set; }

        public DateTime StartTimeUTC { get; set; }
        public DateTime EndTimeUTC { get; set; }
        public string TimeZoneId { get; set; }

        [NotMapped]
        public DateTimeOffset StartTimeOffset
        {
            get
            {
                return TimezoneConverter.GetOffsetByTimeZoneId(StartTimeUTC, TimeZoneId);
            }
        }

        [NotMapped]
        public DateTimeOffset EndTimeOffset
        {
            get
            {
                return TimezoneConverter.GetOffsetByTimeZoneId(EndTimeUTC, TimeZoneId);
            }
        }

        [ForeignKey("UserInfoId")]
        public UserBookingInfo UserInfo { get; set; }
        public int UserInfoId { get; set; }
    }
}
