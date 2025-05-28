namespace RadencyBack.DTO.booking
{
    public class CreateBookingDTO
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public int WorkspaceUnitId { get; set; }
        public DateTime StartTimeUTC { get; set; }
        public DateTime EndTimeUTC { get; set; }
    }
}
