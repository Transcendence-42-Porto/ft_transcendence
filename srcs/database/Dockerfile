FROM postgres:14.3
RUN localedef -i pt_PT -c -f UTF-8 -A /usr/share/locale/locale.alias pt_PT.UTF-8
ENV LANG pt_PT.utf8

USER postgres

EXPOSE 5432

ENV POSTGRES_INITDB_ARGS="--data-checksums"

# uncomment to load the backup file
# comment to start with an empty database
COPY backup.sql /docker-entrypoint-initdb.d/backup.sql

HEALTHCHECK --interval=15s --timeout=3s \
  CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1

CMD ["postgres"]
