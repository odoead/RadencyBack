using RadencyBack.DTO.AI;

namespace RadencyBack.Interfaces
{
    public interface IAIAssistantService
    {
        Task<AssistantResponseDTO> ProcessQueryAsync(string userQuery);

    }
}
