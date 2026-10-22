#!/bin/sh

cp mysh tests
cd tests
clear
./tester/tester.sh
rm mysh
cd ..
