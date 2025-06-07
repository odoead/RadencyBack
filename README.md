# Radency

## Technologies

- **ASP.NET Core Web API**
- **EF Core** (PostgreSQL)
- **FluentValidation** for DTO validation
- **Swashbuckle** for Swagger/OpenAPI
- **Docker+dockercompose** support
- **Angular+Angular Material**
- **Scss**

### Running Locally
- To deploy backend use docker: docker-compose up --build
- To deploy angular :ng serve -o
- Local swagger - localhost:5247/swagger/index.html
- Local Api - localhost:5247
- Local Angular - localhost:4200

### Running Azure
- DB route- coworking.postgres.database.azure.com
- Azure container app - app-coworking-api.wonderfulocean-182f9991.eastus.azurecontainerapps.io
- Azure static web app - kind-cliff-01f04470f.6.azurestaticapps.net (works with localy deployed api)
