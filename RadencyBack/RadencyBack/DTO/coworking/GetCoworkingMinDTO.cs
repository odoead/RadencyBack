using System.Text.Json.Serialization;

namespace RadencyBack.DTO.coworking
{
    public class GetCoworkingMinDTO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("photoUrl")]
        public string FirstPhotoUrl { get; set; }

        [JsonPropertyName("totalCoworkingCapacity")]
        public int TotalCoworkingCapacity { get; set; }

        [JsonPropertyName("totalWorkspaceUnitCount")]
        public int TotalWorkspaceUnitCount { get; set; }

        [JsonPropertyName("openWorkspaceUnitCount")]
        public int OpenWorkspaceUnitCount { get; set; }

        [JsonPropertyName("privateWorkspaceUnitCount")]
        public int PrivateWorkspaceUnitCount { get; set; }

        [JsonPropertyName("meetingWorkspaceUnitCount")]
        public int MeetingWorkspaceUnitCount { get; set; }

    }
}
