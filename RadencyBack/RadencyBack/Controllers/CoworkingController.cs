using Microsoft.AspNetCore.Mvc;
using RadencyBack.DTO.coworking;
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
    public class CoworkingController : ControllerBase
    {
        private readonly ICoworkingService coworkingService;

        public CoworkingController(ICoworkingService coworkingService)
        {
            this.coworkingService = coworkingService;
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(GetCoworkingDetailsDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<GetCoworkingDetailsDTO>> GetCoworkingDetailsByID(int id)
        {
            var coworking = await coworkingService.GetCoworkingDetailsAsync(id);
            if (coworking == null)
                return NotFound();

            return Ok(coworking);
        }

        [HttpPost("check-availability")]
        [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
        public async Task<ActionResult<bool>> CheckAvailability([FromBody] AvailabilityCheckDTO availabilityCheck)
        {
            var isAvailable = await coworkingService.CheckAvailabilityLOCAsync(availabilityCheck.WorkspaceUnitId, availabilityCheck.StartTimeLOC, availabilityCheck.EndTimeLOC, availabilityCheck.ExcludeBookingId);
            return Ok(isAvailable);
        }

        [HttpGet("unavailable-ranges/{workspaceUnitId}")]
        [ProducesResponseType(typeof(GetUnavailableWorkspaceUnitLOCRangesDTO), StatusCodes.Status200OK)]
        public async Task<ActionResult<GetUnavailableWorkspaceUnitLOCRangesDTO>> GetUnavailableWorkspaceUnitLOCRanges(int workspaceUnitId, [FromQuery] int? excludeBookingId = null)
        {
            var unavailableRanges = await coworkingService.GetUnavailableWorkspaceUnitLOCRangesAsync(workspaceUnitId, excludeBookingId);
            return Ok(unavailableRanges);
        }
    }
}
