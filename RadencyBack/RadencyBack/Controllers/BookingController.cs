using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using RadencyBack.DTO.booking;
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
    public class BookingController : Controller
    {
        private readonly IBookingService bookingService;
        private readonly IValidator<CreateBookingDTO> createValidator;
        private readonly IValidator<UpdateBookingDTO> updateValidator;

        public BookingController(IBookingService bookingService, IValidator<CreateBookingDTO> createValidator, IValidator<UpdateBookingDTO> updateValidator)
        {
            this.bookingService = bookingService;
            this.createValidator = createValidator;
            this.updateValidator = updateValidator;
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<GetBookingDTO>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<GetBookingDTO>>> GetAllBookings()
        {
            var bookings = await bookingService.GetAllBookingsAsync();
            return Ok(bookings);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(GetBookingDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<GetBookingDTO>> GetBookingByID(int id)
        {
            var booking = await bookingService.GetBookingByIdAsync(id);

            if (booking == null)
                return NotFound();
            return Ok(booking);
        }

        [HttpPost]
        [ProducesResponseType(typeof(GetBookingDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
        public async Task<ActionResult<GetBookingDTO>> CreateBooking([FromBody] CreateBookingDTO createBookingDto)
        {
            var validationResult = await createValidator.ValidateAsync(createBookingDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
            }

            try
            {
                var booking = await bookingService.CreateBookingAsync(createBookingDto.Name, createBookingDto.Email, createBookingDto.WorkspaceUnitId,
                    createBookingDto.StartTimeLOC, createBookingDto.EndTimeLOC, createBookingDto.TimeZoneId);
                return CreatedAtAction(nameof(GetBookingByID), new { id = booking.Id }, booking);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpPatch("{id}")]
        [ProducesResponseType(typeof(GetBookingDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
        public async Task<ActionResult<GetBookingDTO>> UpdateBookingByID(int id, [FromBody] UpdateBookingDTO updateBookingDto)
        {
            var validationResult = await updateValidator.ValidateAsync(updateBookingDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
            }

            try
            {
                var booking = await bookingService.UpdateBookingAsync(id, updateBookingDto.WorkspaceUnitId, StartTimeLOC: updateBookingDto.StartTimeLOC, EndTimeLOC: updateBookingDto.EndTimeLOC, updateBookingDto.TimeZoneId);

                if (booking == null)
                    return NotFound();

                return Ok(booking);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        public async Task<ActionResult> DeleteBookingByID(int id)
        {
            var result = await bookingService.DeleteBookingAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
