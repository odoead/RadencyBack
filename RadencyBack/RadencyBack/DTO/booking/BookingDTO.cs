namespace RadencyBack.DTO.booking
{
    public class BookingDTO
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public int WorkspaceUnitId { get; set; }
        public string WorkspaceType { get; set; }
        public int WorkspaceCapacity { get; set; }
        public string CoworkingName { get; set; }
        public DateTime StartTimeUTC { get; set; }
        public DateTime EndTimeUTC { get; set; }
    }
}
