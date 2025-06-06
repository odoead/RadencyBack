# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080

# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy project file and restore dependencies (for better layer caching)
COPY ["RadencyBack/RadencyBack.csproj", "RadencyBack/"]
RUN dotnet restore "./RadencyBack/RadencyBack.csproj"

# Copy all source code
COPY . .
WORKDIR "/src/RadencyBack"

# Build the application
RUN dotnet build "./RadencyBack.csproj" -c $BUILD_CONFIGURATION -o /app/build --no-restore

# Publish stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./RadencyBack.csproj" -c $BUILD_CONFIGURATION -o /app/publish

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "RadencyBack.dll"]