using System.Text.Json.Serialization;

namespace RadencyBack.DTO
{
    public class DateTimeRangeDTO
    {
        [JsonPropertyName("start")]
        public DateTime Start { get; set; }

        [JsonPropertyName("end")]
        public DateTime End { get; set; }
    }
}
