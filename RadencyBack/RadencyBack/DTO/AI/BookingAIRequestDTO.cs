namespace RadencyBack.DTO.AI
{
    public class BookingAIRequestDTO
    {
        public int Id { get; set; }
        public string WorkspaceType { get; set; }
        public string CoworkingName { get; set; }
        public string CoworkingAddress { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string TimeZone { get; set; }
        public int MaxCapacity { get; set; }
    }
}
