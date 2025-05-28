namespace RadencyBack.DTO.booking
{
    public class UpdateBookingDTO
    {
        public int WorkspaceUnitId { get; set; }
        public DateTime StartTimeUTC { get; set; }
        public DateTime EndTimeUTC { get; set; }
    }
}
