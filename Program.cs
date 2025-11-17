/// <summary>
/// Entry point for the FinalProjectAPI application.
/// Configures services, middleware, and starts the web application.
/// </summary>
using FinalProjectAPI.Infrastructure.Interfaces;
using FinalProjectAPI.Infrastructure.Interfaces.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Load appsettings.Local.json for local database configuration
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Configure OpenAPI for API documentation
builder.Services.AddOpenApi();

// Register the data repository factory for dependency injection
builder.Services.AddSingleton<IDataRepositoryFactory, DataRepositoryFactory>();

var app = builder.Build();

// Configure the HTTP request pipeline for development environment
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Enable CORS for development to allow requests from the React client
if (app.Environment.IsDevelopment())
{
    app.UseCors(policy =>
    {
        policy.AllowAnyOrigin();
        policy.AllowAnyHeader();
        policy.AllowAnyMethod();
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();