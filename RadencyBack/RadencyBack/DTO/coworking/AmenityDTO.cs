using System.Text.Json.Serialization;

namespace RadencyBack.DTO.coworking
{
    public class AmenityDTO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("icon")]
        public string Icon { get; set; }
    }
}
