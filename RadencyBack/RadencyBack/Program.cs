using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RadencyBack.DB;
using RadencyBack.DTO.booking;
using RadencyBack.Entities;
using RadencyBack.Exceptions;
using RadencyBack.Interfaces;
using RadencyBack.NewFolder;
using RadencyBack.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") ??
                      builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<Context>(options =>
    options.UseNpgsql(connectionString));

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

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                           ?? new[] { "http://localhost:4200", "https://localhost:4200" };

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
    app.UseSwaggerUI();
}

app.ConfigureExceptionHandler();
app.UseCors();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<Context>();
    await Seeder.SeedDataAsync(context);
}

app.Run();