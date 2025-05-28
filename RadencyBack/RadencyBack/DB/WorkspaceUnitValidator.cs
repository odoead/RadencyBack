using FluentValidation;
using RadencyBack.Entities;

namespace RadencyBack.DB
{
    public class WorkspaceUnitValidator : AbstractValidator<WorkspaceUnit>
    {
        public WorkspaceUnitValidator()
        {
            RuleFor(x => x.CoworkingId)
                .GreaterThan(0).WithMessage("CoworkingId is required.");
        }
    }

    public class OpenWorkspaceUnitValidator : AbstractValidator<OpenWorkspaceUnit>
    {
        public OpenWorkspaceUnitValidator()
        {
            Include(new WorkspaceUnitValidator());

            RuleFor(x => x.MaxCapacity)
                .GreaterThan(0).WithMessage("MaxCapacity must be greater than 0.");
        }
    }

    public class PrivateWorkspaceUnitValidator : AbstractValidator<PrivateWorkspaceUnit>
    {
        public PrivateWorkspaceUnitValidator()
        {
            Include(new WorkspaceUnitValidator());

            RuleFor(x => x.MaxCapacity)
                .Must(x => x == 1 || x == 2 || x == 5 || x == 10)
                .WithMessage("MaxCapacity must be one of the following values: 1, 2, 5, 10.");
        }
    }

    public class MeetingWorkspaceUnitValidator : AbstractValidator<MeetingWorkspaceUnit>
    {
        public MeetingWorkspaceUnitValidator()
        {
            Include(new WorkspaceUnitValidator());

            RuleFor(x => x.MaxCapacity)
                .Must(x => x == 10 || x == 20)
                .WithMessage("MaxCapacity must be either 10 or 20.");
        }
    }
}
