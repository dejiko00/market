FROM mcr.microsoft.com/mssql/server:2025-CTP2.0-ubuntu-22.04

USER root

WORKDIR /opt/mssql

COPY --chown=mssql:mssql . .
COPY --chown=mssql:mssql --from=db . .

RUN chmod +x ./entrypoint.sh ./configure-db.sh

USER mssql

ENTRYPOINT [ "./entrypoint.sh" ]