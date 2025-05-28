namespace RadencyBack.DTO.coworking
{
    public class BookableWorkspaceUnitDTO
    {
        public int Id { get; set; }
        public int Capacity { get; set; }
        public bool IsAvailable { get; set; }
        public bool HasCurrentBooking { get; set; }
    }
}
