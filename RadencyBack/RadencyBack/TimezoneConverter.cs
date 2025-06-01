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

            //Convert the UTC DateTime to 'Unspecified' so the constructor accepts the offset
            var unspecified = DateTime.SpecifyKind(dateTimeUTC, DateTimeKind.Unspecified);
            return new DateTimeOffset(unspecified, offset);
           // return new DateTimeOffset(dateTimeUTC, offset);
        }
    }
}
