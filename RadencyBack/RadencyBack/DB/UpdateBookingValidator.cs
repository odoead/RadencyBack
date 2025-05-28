using FluentValidation;
using RadencyBack.DTO.booking;
using RadencyBack.NewFolder;

namespace RadencyBack.DB
{
    public class UpdateBookingValidator : AbstractValidator<UpdateBookingDTO>
    {
        private readonly Context dbcontext;

        public UpdateBookingValidator(Context context)
        {
            dbcontext = context;

            RuleFor(x => x.WorkspaceUnitId)
                .NotEmpty().WithMessage("Workspace selection is required")
                .MustAsync(async (dto, cancellation) => await BookingSharedValidatorHelper.WorkspaceExists(dto, dbcontext, cancellation)).WithMessage("Selected workspace does not exist");

            RuleFor(x => x.StartTimeUTC)
                .NotEmpty().WithMessage("Start time is required");

            RuleFor(x => x.EndTimeUTC)
                .NotEmpty().WithMessage("End time is required")
                .GreaterThan(x => x.StartTimeUTC).WithMessage("End time must be after start time");

            RuleFor(x => x)
                .MustAsync(async (dto, cancellation) => await BookingSharedValidatorHelper.IsInDurationLimits(dto.WorkspaceUnitId, dto.StartTimeUTC, dto.EndTimeUTC, dbcontext, cancellation)).WithMessage("Booking duration exceeds maximum allowed time");
        }




    }
}
