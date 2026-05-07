FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/Waffle.Api/Waffle.Api.csproj", "src/Waffle.Api/"]
RUN dotnet restore "src/Waffle.Api/Waffle.Api.csproj"
COPY . .
RUN dotnet publish "src/Waffle.Api/Waffle.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Waffle.Api.dll"]
