# Use a imagem base oficial do Nginx
FROM nginx:1.21-alpine

# Copiar o arquivo de configuração para o diretório padrão do Nginx
COPY default.conf /etc/nginx/conf.d/default.conf

# Expor a porta padrão do Nginx
EXPOSE 80

# Comando padrão para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
