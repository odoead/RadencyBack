namespace RadencyBack.DTO.coworking
{
    public class AvailabilityCheckDTO
    {
        public int WorkspaceUnitId { get; set; }
        public DateTime StartTimeUTC { get; set; }
        public DateTime EndTimeUTC { get; set; }
        public int? ExcludeBookingId { get; set; }
    }
}
