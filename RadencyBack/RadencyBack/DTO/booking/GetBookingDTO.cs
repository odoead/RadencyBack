using System.Text.Json.Serialization;

namespace RadencyBack.DTO.booking
{
    public class GetBookingDTO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("userId")]
        public string UserName { get; set; }

        [JsonPropertyName("userEmail")]
        public string UserEmail { get; set; }

        [JsonPropertyName("workspaceUnitId")]
        public int WorkspaceUnitId { get; set; }

        [JsonPropertyName("workspaceType")]
        public string WorkspaceType { get; set; }
        //public string WorkspaceUnitName 
        [JsonPropertyName("workspaceCapacity")]
        public int WorkspaceCapacity { get; set; }

        [JsonPropertyName("coworkingName")]
        public string CoworkingName { get; set; }

        [JsonPropertyName("startTimeLOC")]
        public DateTime StartTimeLOC { get; set; }

        [JsonPropertyName("endTimeLOC")]
        public DateTime EndTimeLOC { get; set; }

        [JsonPropertyName("timeZoneId")]
        public string TimeZoneId { get; set; }
    }
}
