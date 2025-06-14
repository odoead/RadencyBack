using Microsoft.AspNetCore.Mvc;
using RadencyBack.DTO.AI;
using RadencyBack.Exceptions;
using RadencyBack.Interfaces;

namespace RadencyBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status501NotImplemented)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status422UnprocessableEntity)]
    public class AiController : Controller
    {
        private readonly IAIAssistantService aiAssistantService;
        private readonly ILogger<AiController> logger;

        public AiController(
            IAIAssistantService aiAssistantService,
            ILogger<AiController> logger)
        {
            this.aiAssistantService = aiAssistantService;
            this.logger = logger;
        }

        [HttpPost("query")]
        [ProducesResponseType(typeof(AssistantResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<AssistantResponseDTO>> ProcessQuery([FromBody] QueryRequestDTO request)
        {
            var response = await aiAssistantService.ProcessQueryAsync(request.Query);
            return Ok(response);

        }
    }
}
