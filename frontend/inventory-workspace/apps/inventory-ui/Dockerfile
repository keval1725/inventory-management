# Build context is frontend/inventory-workspace/ (the Nx workspace root) —
# needs the whole workspace to resolve lib imports across the monorepo.

FROM node:22-alpine AS build
WORKDIR /workspace

COPY package.json package-lock.json ./
# npm ci requires an exact lockfile match, but the host (where the lockfile
# is generated) and this image run different npm majors, which resolve
# dependency ranges slightly differently — npm install tolerates that.
RUN npm install

COPY . .
RUN npx nx build inventory-ui --configuration=docker

FROM nginx:1.27-alpine AS runtime
COPY apps/inventory-ui/nginx.conf /etc/nginx/conf.d/default.conf
# The esbuild-based @angular/build application builder always nests client
# output under browser/, SSR or not.
COPY --from=build /workspace/dist/apps/inventory-ui/browser /usr/share/nginx/html

EXPOSE 80
