using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using RadencyBack.DTO.booking;
using RadencyBack.Interfaces;

namespace RadencyBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
        public async Task<ActionResult<List<GetBookingDTO>>> GetAllBookings()
        {
            var bookings = await bookingService.GetAllBookingsAsync();
            return Ok(bookings);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GetBookingDTO>> GetBookingByID(int id)
        {
            var booking = await bookingService.GetBookingByIdAsync(id);

            if (booking == null)
                return NotFound();
            return Ok(booking);
        }

        [HttpPost]
        public async Task<ActionResult<GetBookingDTO>> CreateBooking([FromBody] CreateBookingDTO createBookingDto)
        {
            var validationResult = await createValidator.ValidateAsync(createBookingDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
            }

            try
            {
                var booking = await bookingService.CreateBookingAsync(createBookingDto.Name, createBookingDto.Email, createBookingDto.WorkspaceUnitId, StartTimeLOC: createBookingDto.StartTimeLOC, EndTimeLOC: createBookingDto.EndTimeLOC, createBookingDto.TimeZoneId);
                return CreatedAtAction(nameof(GetBookingByID), new { id = booking.Id }, booking);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpPatch("{id}")]
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
        public async Task<ActionResult> DeleteBookingByID(int id)
        {
            var result = await bookingService.DeleteBookingAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
