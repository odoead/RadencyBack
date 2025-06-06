using System.Text.Json.Serialization;

namespace RadencyBack.DTO.coworking
{
    public class AvailabilityCheckDTO
    {
        [JsonPropertyName("workspaceUnitId")]
        public int WorkspaceUnitId { get; set; }

        [JsonPropertyName("startTimeLOC")]
        public DateTime StartTimeLOC { get; set; }

        [JsonPropertyName("endTimeLOC")]
        public DateTime EndTimeLOC { get; set; }

        [JsonPropertyName("excludeBookingId")]
        public int? ExcludeBookingId { get; set; }



    }
}
