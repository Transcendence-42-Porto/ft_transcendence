FROM debian:buster

RUN apt update

# Install dependencies
RUN apt-get install -y bison build-essential ca-certificates curl dh-autoreconf doxygen \
flex gawk git iputils-ping libcurl4-gnutls-dev libexpat1-dev libgeoip-dev liblmdb-dev \
libpcre3-dev libpcre++-dev libssl-dev libtool libxml2 libxml2-dev libyajl-dev locales \
lua5.3-dev pkg-config wget zlib1g-dev zlibc libgd-dev libxslt-dev libperl-dev libxslt1-dev \
libgd-dev perl
#****************************************************************************************#

# Download ModSecurity and ModSecurity-Nginx connector from source
RUN git clone --depth 1 -b v3.0.8 https://github.com/SpiderLabs/ModSecurity /opt/ModSecurity && \
    git clone https://github.com/SpiderLabs/ModSecurity-nginx.git /opt/ModSecurity-nginx

# Install ModSecurity
RUN cd /opt/ModSecurity && \
    git submodule init && \
    git submodule update && \
    ./build.sh && \
    ./configure && \
    make && make install

# Download and Install Nginx
RUN cd /opt && wget http://nginx.org/download/nginx-1.15.8.tar.gz && \
    tar -zxvf nginx-1.15.8.tar.gz && \
    cd nginx-1.15.8 && \
    ./configure --prefix=/usr/share/nginx \
                --conf-path=/etc/nginx/nginx.conf \
                --http-log-path=/var/log/nginx/access.log \
                --error-log-path=/var/log/nginx/error.log \
                --lock-path=/var/lock/nginx.lock \
                --pid-path=/run/nginx.pid \
                --modules-path=/usr/lib/nginx/modules \
                --with-http_ssl_module \
                --with-http_stub_status_module \
                --with-http_realip_module \
                --with-http_v2_module \
                --with-http_auth_request_module \
                --with-threads \
                --with-stream \
                --with-stream_ssl_module \
                --with-compat \
                --add-dynamic-module=/opt/ModSecurity-nginx && \
    make && make install 

# Create the ModSecurity modules
RUN cd opt/nginx-1.15.8 && make modules
#****************************************************************************************#

# Setting up OWASP core rule set
#### remove prepackaged rules
RUN rm -rf /usr/share/modsecurity-crs

RUN git clone https://github.com/coreruleset/coreruleset /usr/local/modsecurity-crs

RUN mv /usr/local/modsecurity-crs/crs-setup.conf.example /usr/local/modsecurity-crs/crs-setup.conf &&\
mv /usr/local/modsecurity-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example \
/usr/local/modsecurity-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf

#****************************************************************************************#

# Create the directories
RUN mkdir /etc/nginx/modules

RUN mkdir -p /var/run/nginx

RUN mkdir -p /etc/nginx/modsec

#***************************************************************************************#

# SSL certificate generation
RUN mkdir -p /etc/nginx/ssl

RUN apt install -y openssl

RUN openssl req -x509 -nodes -out /etc/nginx/ssl/transcendence.crt -keyout /etc/nginx/ssl/transcendence.key -subj "/C=PT/ST=Porto/L=Porto/O=42/OU=42/CN=transcendence.42.fr/UID=Transcendence"

#***************************************************************************************#

# Copy the modules files
RUN cp opt/nginx-1.15.8/objs/ngx_http_modsecurity_module.so /etc/nginx/modules/ngx_http_modsecurity_module.so

# Copy the ModSecurity configuration files    
COPY conf/unicode.mapping /etc/nginx/modsec/unicode.mapping

COPY conf/modsecurity.conf /etc/nginx/modsec/modsecurity.conf

COPY conf/main.conf /etc/nginx/modsec/main.conf

COPY conf/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Nginx launch
CMD ["/usr/share/nginx/sbin/nginx", "-g", "daemon off;"]