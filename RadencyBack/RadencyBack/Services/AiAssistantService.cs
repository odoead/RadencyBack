using RadencyBack.DTO.AI;
using RadencyBack.Exceptions;
using RadencyBack.Interfaces;
using System.Text;
using System.Text.Json;

namespace RadencyBack.Services
{
    public class AiAssistantService : IAIAssistantService
    {
        private readonly IBookingService bookingService;
        private readonly HttpClient httpClient;
        private readonly ILogger<AiAssistantService> logger;
        private readonly string groqApiKey;
        private readonly string groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";

        public AiAssistantService(IBookingService bookingService, HttpClient httpClient, IConfiguration configuration, ILogger<AiAssistantService> logger)
        {
            this.bookingService = bookingService;
            this.httpClient = httpClient;
            this.logger = logger;


            groqApiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY") ?? configuration["Groq:ApiKey"] ??
                throw new NotFoundException("Groq API key not configured");

            this.httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {groqApiKey}");
        }

        public async Task<AssistantResponseDTO> ProcessQueryAsync(string userQuery)
        {
            if (string.IsNullOrWhiteSpace(userQuery))
            {
                logger.LogWarning("Received empty query from user.");
                throw new BadRequestException("Query cannot be empty");
            }

            try
            {
                var bookings = await bookingService.GetUserBookingsAiRequestAsync();
                var bookingContext = CreateBookingContext(bookings);
                var systemPrompt = CreateSystemPrompt();
                var userPrompt = CreateUserPrompt(userQuery, bookingContext);

                var groqRequest = new GroqRequest
                {
                    Messages = new List<GroqMessage>
                    {
                        new() { Role = "system", Content = systemPrompt },
                        new() { Role = "user", Content = userPrompt }
                    }
                };

                var response = await CallGroqApiAsync(groqRequest);

                if (response?.IsSuccess == true)
                {
                    var aiResponse = ParseAIResponse(response.Answer);
                    return aiResponse;
                }

                return new AssistantResponseDTO
                {
                    Answer = "I didn't understand that. Please try rephrasing your question.",
                    IsSuccess = false,
                    ErrorMessage = response?.ErrorMessage ?? "Unknown error occurred"
                };
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing query: {Query}", userQuery);
                return new AssistantResponseDTO
                {
                    Answer = "I'm having trouble processing your request right now. Please try again later.",
                    IsSuccess = false,
                    ErrorMessage = ex.Message
                };
            }
        }


        private string CreateSystemPrompt()
        {
            return $@"
<prompt>
  <instructions>
    You are a helpful booking assistant. Your role is to analyze user booking data and answer questions about their bookings in a natural, conversational way.
    IMPORTANT INSTRUCTIONS:
    1. Always provide a clear, direct answer to the user's question
    2. Format dates in a readable format (e.g., 'Monday, May 12, 2024')
    3. Include relevant details like workspace type, location, and time
    4. Be concise but informative
    5. After your main answer, suggest 3 related questions the user might ask, prefixed with 'SUGGESTED_QUESTIONS:'
    6. If no bookings match the criteria, say so clearly
    7. Support queries about: counting bookings, upcoming bookings, specific dates, date ranges, workspace types
  </instructions>
  <dateContext>
    Today is {DateTime.Now:MMMM dd, yyyy}
  </dateContext>
  <responseFormat>
    [Your answer here]

    SUGGESTED_QUESTIONS:
    1. [Question 1]
    2. [Question 2]
    3. [Question 3]
  </responseFormat>
</prompt>";
        }

        private string CreateUserPrompt(string userQuery, string bookingContext)
        {
            logger.LogInformation("Creating user prompt for query: {Query}", userQuery);
            logger.LogInformation("Booking context: {Context}", bookingContext);
            return $@"
<prompt>
  <userQuestion>
    {userQuery}
  </userQuestion>
  <bookingData>
    {bookingContext}
  </bookingData>
  <instructions>
    Please analyze the user's question and provide a helpful response based on their booking data.
  </instructions>
</prompt>";
        }


        private string CreateBookingContext(List<BookingAIRequestDTO> bookings)
        {
            if (!bookings.Any())
            {
                return "<bookings>No bookings found for this user.</bookings>";
            }

            var context = new StringBuilder();
            context.AppendLine("<bookings>");
            context.AppendLine($"  <total>{bookings.Count}</total>");

            foreach (var booking in bookings)
            {
                context.AppendLine("  <booking>");
                context.AppendLine($"    <id>{booking.Id}</id>");
                context.AppendLine($"    <workspaceType>{booking.WorkspaceType} Room</workspaceType>");
                context.AppendLine($"    <location>{booking.CoworkingName}, {booking.CoworkingAddress}</location>");
                context.AppendLine($"    <date>{booking.StartTime:MMMM dd, yyyy (dddd)}</date>");
                context.AppendLine($"    <time>{booking.StartTime:hh:mm tt} - {booking.EndTime:hh:mm tt}</time>");
                context.AppendLine($"    <capacity>{booking.MaxCapacity} people</capacity>");
                context.AppendLine("  </booking>");
            }

            context.AppendLine("</bookings>");
            logger.LogInformation("Created booking context: {Context}", context.ToString());
            return context.ToString();
        }

        private async Task<AssistantResponseDTO> CallGroqApiAsync(GroqRequest request)
        {
            try
            {
                var json = JsonSerializer.Serialize(request);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync(groqApiUrl, content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var groqResponse = JsonSerializer.Deserialize<GroqResponse>(responseContent);

                    return new AssistantResponseDTO
                    {
                        Answer = groqResponse?.Choices?.FirstOrDefault()?.Message?.Content ?? "No response received",
                        IsSuccess = true
                    };
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                logger.LogError("Groq API error: {StatusCode} - {Content}", response.StatusCode, errorContent);

                return new AssistantResponseDTO
                {
                    IsSuccess = false,
                    ErrorMessage = $"API Error: {response.StatusCode}"
                };
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error calling Groq API");
                return new AssistantResponseDTO
                {
                    IsSuccess = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        private AssistantResponseDTO ParseAIResponse(string aiResponse)
        {
            var lines = aiResponse.Split('\n', StringSplitOptions.RemoveEmptyEntries);
            var suggestedQuestionsIndex = Array.FindIndex(lines, line =>
                line.Trim().StartsWith("SUGGESTED_QUESTIONS:", StringComparison.OrdinalIgnoreCase));

            string answer;
            var suggestedQuestions = new List<string>();

            if (suggestedQuestionsIndex > 0)
            {
                answer = string.Join('\n', lines.Take(suggestedQuestionsIndex)).Trim();

                for (int i = suggestedQuestionsIndex + 1; i < lines.Length; i++)
                {
                    var line = lines[i].Trim();
                    if (line.StartsWith("1.") || line.StartsWith("2.") || line.StartsWith("3."))
                    {
                        suggestedQuestions.Add(line.Substring(2).Trim());
                    }
                }
            }
            else
            {
                answer = aiResponse.Trim();
            }

            return new AssistantResponseDTO
            {
                Answer = answer,
                SuggestedQuestions = suggestedQuestions,
                IsSuccess = true
            };
        }
    }
}
