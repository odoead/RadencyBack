using System.Text.Json.Serialization;

namespace RadencyBack.DTO.coworking
{
    public class BookableWorkspaceUnitDTO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("capacity")]
        public int Capacity { get; set; }

        [JsonPropertyName("isAvailable")]
        public bool IsAvailable { get; set; }

        [JsonPropertyName("hasCurrentBooking")]
        public bool HasCurrentBooking { get; set; }
    }
}
