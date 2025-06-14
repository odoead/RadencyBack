using System.Text.Json.Serialization;

namespace RadencyBack.DTO.AI
{
    public class AssistantResponseDTO
    {
        [JsonPropertyName("answer")]
        public string Answer { get; set; }

        [JsonPropertyName("suggestedQuestions")]
        public List<string> SuggestedQuestions { get; set; } = new();

        [JsonPropertyName("isSuccess")]
        public bool IsSuccess { get; set; }

        [JsonPropertyName("errorMessage")]
        public string ErrorMessage { get; set; }
    }
}
