using System.Text.Json.Serialization;

namespace RadencyBack.DTO.AI
{
    public class QueryRequestDTO
    {
        [JsonPropertyName("query")]
        public string Query { get; set; }

    }
}
