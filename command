#!/bin/sh
./node_modules/.bin/ts-node --files index.ts -- --command $*
# SP_COLOUR="\e[37;41m"
# SP_WIDTH=1.1  ## Try: SP_WIDTH=5.5
# SP_DELAY=.15

# spinner(){
#     SP_STRING=${2:-"-/|\\"}
#     while [ -d /proc/$1 ]
#     do
#         printf "$SP_COLOUR\e7  %${SP_WIDTH}s  \e8\e[0m" "$SP_STRING"
#         sleep ${SP_DELAY:-.2}
#         SP_STRING=${SP_STRING#"${SP_STRING%?}"}${SP_STRING%?}
#     done
# }
# echo --------------------------ViralWorks----------------------------
# ./node_modules/.bin/ts-node --files index.ts -- --command $* &
# spinner "$!"