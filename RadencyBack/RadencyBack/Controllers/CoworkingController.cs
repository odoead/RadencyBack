using Microsoft.AspNetCore.Mvc;
using RadencyBack.DTO.coworking;
using RadencyBack.Interfaces;

namespace RadencyBack.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class CoworkingController : ControllerBase
    {
        private readonly ICoworkingService coworkingService;

        public CoworkingController(ICoworkingService coworkingService)
        {
            this.coworkingService = coworkingService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GetCoworkingDetailsDTO>> GetCoworkingDetailsByID(int id)
        {
            var coworking = await coworkingService.GetCoworkingDetailsAsync(id);
            if (coworking == null)
                return NotFound();

            return Ok(coworking);
        }

        [HttpPost("check-availability")]
        public async Task<ActionResult<bool>> CheckAvailability([FromBody] AvailabilityCheckDTO availabilityCheck)
        {
            var isAvailable = await coworkingService.CheckAvailabilityLOCAsync(availabilityCheck.WorkspaceUnitId, availabilityCheck.StartTimeLOC, availabilityCheck.EndTimeLOC, availabilityCheck.ExcludeBookingId);
            return Ok(isAvailable);
        }

        [HttpGet("unavailable-ranges/{workspaceUnitId}")]
        public async Task<ActionResult<GetUnavailableWorkspaceUnitLOCRangesDTO>> GetUnavailableWorkspaceUnitLOCRanges(int workspaceUnitId, [FromQuery] int? excludeBookingId = null)
        {
            var unavailableRanges = await coworkingService.GetUnavailableWorkspaceUnitLOCRangesAsync(workspaceUnitId, excludeBookingId);
            return Ok(unavailableRanges);
        }
    }
}
