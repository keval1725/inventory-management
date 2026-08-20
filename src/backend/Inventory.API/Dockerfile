# Build context is the repo root (InventoryManagement/) — needs the whole
# solution to restore project references correctly.

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Inventory.sln ./
COPY src/backend/Inventory.Domain/Inventory.Domain.csproj src/backend/Inventory.Domain/
COPY src/backend/Inventory.Application/Inventory.Application.csproj src/backend/Inventory.Application/
COPY src/backend/Inventory.Infrastructure/Inventory.Infrastructure.csproj src/backend/Inventory.Infrastructure/
COPY src/backend/Inventory.Persistence/Inventory.Persistence.csproj src/backend/Inventory.Persistence/
COPY src/backend/Inventory.API/Inventory.API.csproj src/backend/Inventory.API/
COPY src/backend/Inventory.Shared/Inventory.Shared.csproj src/backend/Inventory.Shared/
RUN dotnet restore src/backend/Inventory.API/Inventory.API.csproj

COPY src/backend/ src/backend/
RUN dotnet publish src/backend/Inventory.API/Inventory.API.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .

EXPOSE 8080
ENTRYPOINT ["dotnet", "Inventory.API.dll"]
