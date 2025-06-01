using System.Text.Json.Serialization;

namespace RadencyBack.DTO.coworking
{
    public class GetCoworkingDetailsDTO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("workspaceTypes")]
        public List<WorkspacesByTypeDTO> WorkspaceTypes { get; set; }

        [JsonPropertyName("amenities")]
        public List<AmenityDTO> Amenities { get; set; }

        [JsonPropertyName("photoUrls")]
        public List<string> PhotoUrls { get; set; }
    }
}
