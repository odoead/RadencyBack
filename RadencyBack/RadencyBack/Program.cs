using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RadencyBack.DB;
using RadencyBack.DTO.booking;
using RadencyBack.Entities;
using RadencyBack.Exceptions;
using RadencyBack.Interfaces;
using RadencyBack.NewFolder;
using RadencyBack.Services;
using Swashbuckle.AspNetCore.Filters;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddSimpleConsole(options =>
{
    options.IncludeScopes = true;
    options.SingleLine = true;
    options.TimestampFormat = "HH:mm:ss ";
});


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") ??
    builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<Context>(options =>
    options.UseNpgsql(connectionString));

// Swagger config
builder.Services.AddSwaggerExamples();
builder.Services.AddSwaggerExamplesFromAssemblies(Assembly.GetExecutingAssembly());
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Radency Coworking API",
        Version = "v1",
    });

    var xmlFile = $"{Assembly.GetEntryAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
});

// Services 
builder.Services.AddScoped<IValidator<Amenity>, AmenityValidator>();
builder.Services.AddScoped<IValidator<Booking>, BookingValidator>();
builder.Services.AddScoped<IValidator<Coworking>, CoworkingValidator>();
builder.Services.AddScoped<IValidator<UpdateBookingDTO>, UpdateBookingValidator>();
builder.Services.AddScoped<IValidator<CreateBookingDTO>, CreateBookingValidator>();
builder.Services.AddScoped<IValidator<UserBookingInfo>, UserBookingInfoValidator>();
builder.Services.AddScoped<IValidator<WorkspaceUnit>, WorkspaceUnitValidator>();
builder.Services.AddScoped<IValidator<OpenWorkspaceUnit>, OpenWorkspaceUnitValidator>();
builder.Services.AddScoped<IValidator<PrivateWorkspaceUnit>, PrivateWorkspaceUnitValidator>();
builder.Services.AddScoped<IValidator<MeetingWorkspaceUnit>, MeetingWorkspaceUnitValidator>();





builder.Services.AddScoped<ICoworkingService, CoworkingService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IAIAssistantService, AiAssistantService>();
builder.Services.AddHttpClient<AiAssistantService>();


// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var azureStaticWebAppsUrl = Environment.GetEnvironmentVariable("AZURE_STATIC_WEB_APPS_URL");
        var allowedOrigins = azureStaticWebAppsUrl != null
            ? new[] { azureStaticWebAppsUrl }
            : builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();


        policy.WithOrigins(allowedOrigins)
             .AllowAnyMethod()
             .AllowAnyHeader()
             .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "RadencyBack v1");
        c.EnableDeepLinking();
        c.DefaultModelExpandDepth(0);
    });
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor
    | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto
});

app.ConfigureExceptionHandler();
app.UseCors();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Seed data
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<Context>();
    //await dbContext.Database.MigrateAsync();

    await Seeder.SeedDataAsync(dbContext);
}

app.Run();