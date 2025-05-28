using FluentValidation;
using RadencyBack.Entities;

namespace RadencyBack.DB
{
    public class BookingValidator : AbstractValidator<Booking>
    {
        public BookingValidator()
        {


            RuleFor(x => x.StartTimeUTC)
                .NotEmpty().WithMessage("StartTimeUTC is required.");

            RuleFor(x => x.EndTimeUTC)
                .NotEmpty().WithMessage("EndTimeUTC is required.")
                .GreaterThan(x => x.StartTimeUTC).WithMessage("EndTimeUTC must be after StartTimeUTC.");

            RuleFor(x => x.UserInfoId)
                .NotEmpty().WithMessage("UserInfoId is required.");
        }
    }
}
