namespace RadencyBack.DTO.coworking
{
    public class WorkspacesByTypeDTO
    {
        public string Type { get; set; }
        public List<BookableWorkspaceUnitDTO> Units { get; set; }
    }
}
