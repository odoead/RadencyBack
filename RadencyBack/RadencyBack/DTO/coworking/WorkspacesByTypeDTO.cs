using System.Text.Json.Serialization;

namespace RadencyBack.DTO.coworking
{
    public class WorkspacesByTypeDTO
    {
        [JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("units")]
        public List<BookableWorkspaceUnitDTO> Units { get; set; }
    }
}
