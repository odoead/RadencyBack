using FluentValidation;
using RadencyBack.Entities;

namespace RadencyBack.DB
{
    public class AmenityValidator : AbstractValidator<Amenity>
    {
        public AmenityValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Amenity name is required.");

            RuleFor(x => x.Icon)
                .NotEmpty().WithMessage("Amenity icon is required.");
        }
    }
}
