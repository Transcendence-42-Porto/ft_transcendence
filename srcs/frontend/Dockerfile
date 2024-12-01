# Use a imagem do Nginx
FROM nginx:alpine

# Copiar os arquivos locais para o diretório /usr/share/nginx/html
COPY ./ /usr/share/nginx/html/

# Ajustar permissões
RUN chown -R nginx:nginx /usr/share/nginx/html && chmod -R 775 /usr/share/nginx/html

# Expor a porta padrão do Nginx
EXPOSE 80
