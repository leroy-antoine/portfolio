/*
** EPITECH PROJECT, 2025
** 107transfer
** File description:
** is_int_float
*/

#include <string.h>
#include <ctype.h>
#include "my.h"

static int return_value(int error, int sign, int point)
{
    if (error == 0)
        return NATURAL;
    if (error == sign)
        return INTEGER;
    if (error == sign + point)
        return RATIONAL;
    return MY_NAN;
}

int is_int_float(char *av)
{
    int error = 0;
    int sign = 0;
    int point = 0;

    if (av[0] == '\0')
        return MY_NAN;
    for (int i = 0; av[i] != '\0'; i++) {
        if (isdigit(av[i]) == 0)
            error++;
        if (av[i] == '-' && sign == 0)
            sign++;
        if (av[i] == '.' && point == 0)
            point++;
    }
    return return_value(error, sign, point);
}
