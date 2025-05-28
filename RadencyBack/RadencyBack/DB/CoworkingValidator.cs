using FluentValidation;
using RadencyBack.Entities;

namespace RadencyBack.DB
{
    public class CoworkingValidator : AbstractValidator<Coworking>
    {
        public CoworkingValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Coworking name is required.");

            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Coworking address is required.");
        }
    }
}
