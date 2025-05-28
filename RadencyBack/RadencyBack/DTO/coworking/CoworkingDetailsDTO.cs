namespace RadencyBack.DTO.coworking
{
    public class CoworkingDetailsDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }  
        public string Address { get; set; }  
        public List<WorkspacesByTypeDTO> WorkspaceTypes { get; set; }
        public List<AmenityDTO> Amenities { get; set; }
        public List<string> PhotoUrls { get; set; }
    }
}
