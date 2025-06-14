using System.Text.Json.Serialization;

namespace RadencyBack.DTO.AI
{
    public class GroqRequest
    {
        [JsonPropertyName("messages")]
        public List<GroqMessage> Messages { get; set; } = new();

        [JsonPropertyName("model")]
        public string Model { get; set; } = "llama-3.3-70b-versatile";

        [JsonPropertyName("temperature")]
        public double Temperature { get; set; } = 0.3;

        [JsonPropertyName("max_tokens")]
        public int MaxTokens { get; set; } = 1000;
    }

    public class GroqMessage
    {
        [JsonPropertyName("role")]
        public string Role { get; set; }

        [JsonPropertyName("content")]
        public string Content { get; set; }
    }

    public class GroqResponse
    {
        [JsonPropertyName("choices")]
        public List<GroqChoice> Choices { get; set; } = new();
    }

    public class GroqChoice
    {
        [JsonPropertyName("message")]
        public GroqMessage Message { get; set; }
    }
}
