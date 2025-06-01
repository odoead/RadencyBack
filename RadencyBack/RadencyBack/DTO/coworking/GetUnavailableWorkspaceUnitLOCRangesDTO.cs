using System.Text.Json.Serialization;

namespace RadencyBack.DTO.coworking
{
    public class GetUnavailableWorkspaceUnitLOCRangesDTO
    {
        [JsonPropertyName("workspaceUnitId")]
        public int WorkspaceUnitId { get; set; }

        [JsonPropertyName("unavailableRanges")]
        public List<DateTimeRangeDTO> UnavailableRanges { get; set; }


    }
}
