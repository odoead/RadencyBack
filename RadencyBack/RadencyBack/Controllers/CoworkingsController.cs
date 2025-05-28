using Microsoft.AspNetCore.Mvc;
using RadencyBack.DTO.coworking;
using RadencyBack.Interfaces;

namespace RadencyBack.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class CoworkingsController : ControllerBase
    {
        private readonly ICoworkingService _coworkingService;

        public CoworkingsController(ICoworkingService coworkingService)
        {
            _coworkingService = coworkingService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CoworkingDetailsDTO>> GetCoworkingDetailsByID(int id)
        {
            var coworking = await _coworkingService.GetCoworkingDetailsAsync(id);
            if (coworking == null)
                return NotFound();

            return Ok(coworking);
        }

        [HttpPost("check-availability")]
        public async Task<ActionResult<bool>> CheckAvailability([FromBody] AvailabilityCheckDTO availabilityCheck)
        {
            var isAvailable = await _coworkingService.CheckAvailabilityAsync(availabilityCheck.WorkspaceUnitId, availabilityCheck.StartTimeUTC, availabilityCheck.EndTimeUTC, availabilityCheck.ExcludeBookingId);
            return Ok(isAvailable);
        }
    }
}
