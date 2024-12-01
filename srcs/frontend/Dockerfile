# Use a imagem do Nginx
FROM nginx:alpine

# Copiar os arquivos locais para o diretório /usr/share/nginx/html
COPY ./ /usr/share/nginx/html/

# Copiar o arquivo de configuração customizado para o container
COPY ./default.conf /etc/nginx/nginx.conf

# Ajustar permissões
RUN chown -R nginx:nginx /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html

# Expor a porta padrão do Nginx
EXPOSE 80
