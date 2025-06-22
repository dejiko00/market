#!/bin/bash

# Wait 60 seconds for SQL Server to start up by ensuring that 
# calling SQLCMD does not return an error code, which will ensure that sqlcmd is accessible
# and that system and user databases return "0" which means all databases are in an "online" state
# https://docs.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-databases-transact-sql?view=sql-server-2017 
# https://github.com/microsoft/mssql-docker/tree/master/linux/preview/examples/mssql-customize (OUTDATED as of 6/21/25)[SBO]

i=0
EXITCODE=1
DBSTATUS=LOADING

while [[ $i -lt 60 ]] && [[ $EXITCODE -ne 0 ]]; do
	sleep 5
	DBSTATUS=$(/opt/mssql-tools18/bin/sqlcmd -b -h -1 -t 5 -W -S $(hostname),1437 -U sa -P "$MSSQL_SA_PASSWORD" -No -Q "SET NOCOUNT ON; SELECT SUM(state) from sys.databases;")
	EXITCODE=$?
    i=$((i + 5))
    echo "═( ु´•͈ω•͈)ゞ═══[Loop: $i | EXITCODE: $EXITCODE]══════════════════════════════════"
done

if [[ $EXITCODE -ne 0 ]]; then 
	echo "═══════════════════════(╯︵╰,) [$EXITCODE!] (╯︵╰,)═════════════════════════════"
    echo "# SQL Server took more than 60 seconds to start up...."
    echo "# Or one or more databases are not in an ONLINE state."
    echo "> $DBSTATUS"
    echo "~~~"
    echo "(っ╥╯﹏╰╥c)"
    echo "════════════════════════════════════════════════════════════════════════════════"
	exit 1
fi

echo "═══════════════════════════(◕‿◕) [$EXITCODE~] (◕‿◕)═════════════════════════════"
echo "# SQL Server is working."
echo "# Starting SQL script......."
# Run the setup script to create the DB and the schema in the DB
/opt/mssql-tools18/bin/sqlcmd -h -1 -t 10 -S $(hostname),1437 -U sa -P "$MSSQL_SA_PASSWORD" -No -d master -i setup.sql
EXITCODE=$?
echo "~~~"
echo "# Finished script (⁀ᗢ⁀)... $EXITCODE"
echo "# Result is................. $EXITCODE"
echo "════════════════════════════════════════════════════════════════════════════════════"