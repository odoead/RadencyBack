using FluentValidation;
using RadencyBack.DTO.booking;
using RadencyBack.NewFolder;

namespace RadencyBack.DB
{
    public class CreateBookingValidator : AbstractValidator<CreateBookingDTO>
    {
        private readonly Context dbcontext;

        public CreateBookingValidator(Context context)
        {
            dbcontext = context;

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format");

            RuleFor(x => x.WorkspaceUnitId)
                .NotEmpty().WithMessage("Workspace selection is required")
                .MustAsync(async (dto, cancellation) => await BookingSharedValidatorHelper.WorkspaceExists(dto, dbcontext, cancellation)).WithMessage("Selected workspace does not exist");

            RuleFor(x => x.StartTimeUTC)
                .NotEmpty().WithMessage("Start time is required")
                .Must((xx, cancellation) => BookingSharedValidatorHelper.IsInUTCFuture(xx.StartTimeUTC)).WithMessage("Start time must be in the future");

            RuleFor(x => x.EndTimeUTC)
                .NotEmpty().WithMessage("End time is required")
                .GreaterThan(x => x.StartTimeUTC).WithMessage("End time must be after start time");

            RuleFor(x => x)
                .MustAsync(async (dto, cancellation) => await BookingSharedValidatorHelper.IsInDurationLimits(dto.WorkspaceUnitId, dto.StartTimeUTC, dto.EndTimeUTC, dbcontext, cancellation))
                .WithMessage("Booking duration exceeds maximum allowed time");
        }




    }
}
