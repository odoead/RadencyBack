using System.Text.Json.Serialization;

namespace RadencyBack.DTO.booking
{
    public class CreateBookingDTO
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }


        [JsonPropertyName("workspaceUnitId")]
        public int WorkspaceUnitId { get; set; }

        [JsonPropertyName("startTimeLOC")]
        public DateTime StartTimeLOC { get; set; }

        [JsonPropertyName("endTimeLOC")]
        public DateTime EndTimeLOC { get; set; }

        [JsonPropertyName("timeZoneId")]
        public string TimeZoneId { get; set; }

    }
}
