FROM mcr.microsoft.com/devcontainers/javascript-node:24-bookworm

RUN apt-get update \
    && apt-get install --yes --no-install-recommends \
        ca-certificates \
        curl \
        fd-find \
        gh \
        git \
        imagemagick \
        jq \
        ripgrep \
        unzip \
        wget \
        yq \
        zip \
    && ln -sf /usr/bin/fdfind /usr/local/bin/fd \
    && rm -rf /var/lib/apt/lists/*

RUN npm install --global npm@11.6.2

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN npx -y playwright@1.62.1 install --with-deps chromium \
    && chmod -R 755 /ms-playwright
