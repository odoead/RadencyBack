namespace RadencyBack
{
    public static class TimezoneConverter
    {
        public static DateTime GetUtcFromLocal(DateTime localTime, string timeZoneId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            return TimeZoneInfo.ConvertTimeToUtc(localTime, timeZone);
        }

        public static DateTime GetLocalFromUtc(DateTime utcTime, string timeZoneId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            return TimeZoneInfo.ConvertTimeFromUtc(utcTime, timeZone);
        }

        public static DateTimeOffset GetOffsetByTimeZoneId(DateTime dateTimeUTC, string timeZoneId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            var offset = timeZone.GetUtcOffset(dateTimeUTC);
            return new DateTimeOffset(dateTimeUTC, offset);
        }
    }
}
