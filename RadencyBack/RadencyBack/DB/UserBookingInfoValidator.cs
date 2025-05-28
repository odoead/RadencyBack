using FluentValidation;
using RadencyBack.Entities;

namespace RadencyBack.DB
{
    public class UserBookingInfoValidator : AbstractValidator<UserBookingInfo>
    {
        public UserBookingInfoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email address.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.");
        }
    }
}
