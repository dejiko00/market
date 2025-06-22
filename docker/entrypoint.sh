#!/bin/bash
bash /opt/mssql/configure-db.sh &
/opt/mssql/bin/sqlservr
