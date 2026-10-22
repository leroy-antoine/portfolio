#!/bin/sh
SUCCESS=0
FAILED=0
TOTAL=0
make

err() {
    TOTAL=$((TOTAL+1))
    rm a -f
    IS="$(echo $1 | timeout 2 ./42sh 2>&1)"
    rm a -f
    SHOULD="$(echo $1 | timeout 2 tcsh 2>&1)"
    if test "$(echo $IS)" != "$(echo $SHOULD)"
    then
        FAILED=$((FAILED+1))
        echo "\033[31mIncorect output:\033[0m"
        echo $IS
        echo $SHOULD
    else
        SUCCESS=$((SUCCESS+1))
        echo "\033[32mCorrect output\033[0m"
        echo $IS
    fi
}

out() {
    TOTAL=$((TOTAL+1))
    rm a -f
    IS="$(echo $1 | timeout 2 ./42sh 2> /dev/null)"
    rm a -f
    SHOULD="$(echo $1 | timeout 2 tcsh 2> /dev/null)"
    if test "$(echo $IS)" != "$(echo $SHOULD)"
    then
        FAILED=$((FAILED+1))
        echo "\033[31mIncorect output:\033[0m"
        echo $IS
        echo $SHOULD
    else
        SUCCESS=$((SUCCESS+1))
        echo "\033[32mCorrect output\033[0m"
        echo $IS
    fi
}

outerr() {
    echo "=============================="
    echo "COMMAND : " $1
    echo "------------------------------"
    out "$1"
    err "$1"

}

# basic
outerr "ls"

# semicolon
outerr ";"
outerr "ls ;"
outerr "; ls"
outerr "ls ; ls"

# pipe
outerr "ls | cat -e"
outerr "ls | cat -e | cat -e"
outerr "| cat -e | cat -e"
outerr "| cat -e"
outerr "ls | "
outerr "| "

# left
outerr "ls > a ; cat a"
outerr "ls >"
outerr "> a"
outerr ">"
outerr "ls > \"\""
outerr "ls > \" \""
outerr "\"\" > a"
outerr "\"\" > \"\""

# 2xleft
outerr "ls >> a ; cat a"
outerr "ls >>"
outerr ">> a"
outerr ">>"
outerr "ls >> \"\""
outerr "\"\" >> a"
outerr "\"\" >> \"\""
outerr "ls | cat -e > a ; ls | grep a >> a ; cat a"
outerr "ls | cat -e >> a ; ls | grep a > a ; cat a"

# right
outerr "ls > a ; cat -e < a"
outerr "ls > a ; cat -e < "
outerr "ls > a ;  < a"
outerr "ls > a ;  < "
outerr "ls > a ; \"\" < a"
outerr "ls > a ; \"\" < \"\""
outerr "ls > a ; cat -e < \"\""

# 2xright
outerr "cat -e << "
outerr "cat -e << \"\""
outerr "<<"
outerr "\"\" << \"\""
outerr "<< exit"
outerr "\"\" << exit"
outerr "cat -e << exit > a ; cat a"

outerr "cat -e > exit > a"
outerr "cat -e > exit < a"
outerr "cat -e > exit > a > a"
outerr "cat -e > exit > a < a"
outerr "cat -e << exit < a"
outerr "cat -e < exit <<"
outerr "cat -e < exit << a < a"
outerr "cat -e < exit << a <"
outerr "cat -e < exit >> a < a"
outerr "cat -e > exit < a"
outerr "cat -e > exit < a < a < a"
outerr "ls | c < a"
outerr "ls | c < "
outerr "ls |  < a"
outerr " | c < a"
outerr " |  < "
outerr "ls > c < a"
outerr "c < a"
outerr "ls > a | cat -e"
outerr "ls|cat -e|cat -e"
outerr "exit 1"
outerr "exit 1 2"
outerr "exit a"
outerr "exit"
outerr "exit | ls"


FILES="$(ls -1 tests/unitest/SUCCESS* tests/unitest/ERROR*)"
for X in $FILES
do
    outerr "$(cat $X)"
done
echo "=============================="

rm a ' ' tests/unitest/redirect -f &> /dev/null

if test "$TOTAL" != 0
then
    echo "\033[34mTOTAL : $TOTAL\033[0m"
    echo -------------------------------
fi
if test "$SUCCES" != 0
then
    echo "\033[32mSUCCESS : $SUCCESS\033[0m"
    echo -------------------------------
fi
if test "$FAILED" != 0
then
    echo "\033[31mFAILED : $FAILED\033[0m"
    echo -------------------------------
fi
if test "$FAILED" = 0
then
    echo "\033[32mALL TESTS SUCCEDED\033[0m"
    echo ===============================
else
    echo "\033[31mONE OR MORE FAILED\033[0m"
    echo ===============================
fi
SUCCESS_POURCENTS=$(($((SUCCESS * 100)) / $((TOTAL * 5)) - 1))
FAILED_POURCENTS=$(($((FAILED * 100)) / $((TOTAL * 5)) - 1))
echo "completion: $(($((SUCCESS * 100)) / TOTAL))%"
echo ===============================
while test $SUCCESS_POURCENTS -ge 0
do
    echo -n "\033[32m#\033[0m"
    SUCCESS_POURCENTS=$((SUCCESS_POURCENTS - 1))
done
while test $FAILED_POURCENTS -ge 0
do
    echo -n "\033[31m#\033[0m"
    FAILED_POURCENTS=$((FAILED_POURCENTS - 1))
done
echo ""
echo ===============================