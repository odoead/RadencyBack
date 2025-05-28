using Microsoft.EntityFrameworkCore;
using RadencyBack.Entities;
using RadencyBack.NewFolder;

namespace RadencyBack.DB
{
    public static class BookingSharedValidatorHelper
    {
        public static async Task<bool> WorkspaceExists(int workspaceUnitId, Context dbcontext, CancellationToken cancellationToken)
        {
            return await dbcontext.WorkspaceUnits.AnyAsync(w => w.Id == workspaceUnitId, cancellationToken);
        }

        public static async Task<bool> IsInDurationLimits(int WorkspaceID, DateTime StartTimeUTC, DateTime EndTimeUTC, Context dbcontext, CancellationToken cancellationToken)
        {
            var workspace = await dbcontext.WorkspaceUnits.FindAsync(WorkspaceID, cancellationToken);
            if (workspace == null) return false;

            var duration = EndTimeUTC - StartTimeUTC;

            return workspace switch
            {
                OpenWorkspaceUnit or PrivateWorkspaceUnit => duration.TotalDays <= 30,
                MeetingWorkspaceUnit => duration.TotalDays <= 1,
                _ => false
            };
        }
        public static bool IsInUTCFuture(DateTime startTimeUTC)
        {
            return startTimeUTC > DateTime.UtcNow;
        }
    }
}
