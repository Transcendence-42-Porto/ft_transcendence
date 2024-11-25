# Use a imagem oficial do Nginx baseada no Alpine (leve)
FROM nginx:alpine

# Copie os arquivos do seu frontend (HTML, CSS, JS, etc) para o diretório onde o Nginx os servirá
COPY . /usr/share/nginx/html

# Exponha a porta 80, que é a padrão do Nginx
EXPOSE 80

# Comando padrão para iniciar o Nginx em modo foreground
CMD ["nginx", "-g", "daemon off;"]
