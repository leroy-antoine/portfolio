/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** get_condition
*/

#include "mysh.h"
#include "formatsh.h"
#include "my.h"
#include <string.h>
#include <unistd.h>

static int cmp_nb_next(char *cmp, int one, int two)
{
    if (strcmp(cmp, str_cmp[CMP_GREATER_EQUAL]) == 0) {
        if (one >= two)
            return true;
        return false;
    }
    if (strcmp(cmp, str_cmp[CMP_LESS]) == 0) {
        if (one < two)
            return true;
        return false;
    }
    if (strcmp(cmp, str_cmp[CMP_LESS_EQUAL]) == 0) {
        if (one <= two)
            return true;
        return false;
    }
    return SKIP;
}

static int cmp_nb(char *cmp, int one, int two)
{
    if (strcmp(cmp, str_cmp[CMP_EQUAL]) == 0) {
        if (one == two)
            return true;
        return false;
    }
    if (strcmp(cmp, str_cmp[CMP_NOT_EQUAL]) == 0) {
        if (one != two)
            return true;
        return false;
    }
    if (strcmp(cmp, str_cmp[CMP_GREATER]) == 0) {
        if (one > two)
            return true;
        return false;
    }
    return cmp_nb_next(cmp, one, two);
}

static int get_nb_condition(char *cmp, int one, int two, bool *condition)
{
    int value = cmp_nb(cmp, one, two);

    if (value != SKIP) {
        *condition = value;
        return SUCCESS;
    }
    return ERROR;
}

static int get_one_nb_condition(int nb, bool *condition)
{
    if (nb == 0)
        *condition = false;
    else
        *condition = true;
    return SUCCESS;
}

static int get_str_condition(char *cmp, char *one, char *two, bool *condition)
{
    if (strcmp(cmp, str_cmp[CMP_EQUAL]) == 0) {
        if (strcmp(one, two) == 0) {
            *condition = true;
            return SUCCESS;
        }
        *condition = false;
        return SUCCESS;
    }
    if (strcmp(cmp, str_cmp[CMP_NOT_EQUAL]) == 0) {
        if (strcmp(one, two) != 0) {
            *condition = true;
            return SUCCESS;
        }
        *condition = false;
        return SUCCESS;
    }
    return ERROR;
}

static int get_condition_one_args(char **args, bool *condition, int *ind)
{
    *ind = 3;
    if (get_nb_condition(*args, 0, 0, condition) == SUCCESS)
        return SUCCESS;
    if (is_int_float(*args) > INTEGER) {
        *condition = false;
        return ERROR;
    }
    return get_one_nb_condition(atoi(*args), condition);
}

static int get_condition_two_args(char **args, bool *condition, int *ind)
{
    *ind = 4;
    if (is_int_float(*args) < RATIONAL)
        return get_nb_condition(args[1], atoi(*args), 0, condition);
    if (is_int_float(args[1]) < RATIONAL)
        return get_nb_condition(*args, 0, atoi(args[1]), condition);
    if (get_str_condition(args[1], *args, "", condition) == ERROR
        && get_str_condition(*args, "", args[1], condition) == ERROR)
        return ERROR;
    return SUCCESS;
}

static int get_condition_three_args(char **args, bool *condition, int *ind)
{
    *ind = 5;
    if (is_int_float(*args) < RATIONAL && is_int_float(args[2]) < RATIONAL)
        return get_nb_condition(
            args[1], atoi(*args), atoi(args[2]), condition);
    return get_str_condition(args[1], *args, args[2], condition);
}

int get_condition(char **args, bool *condition, int *ind)
{
    if (*args[0] != *str_management[OPEN_PARE]) {
        if (is_int_float(args[0]) > INTEGER)
            return ERROR;
        *ind = 1;
        return get_one_nb_condition(atoi(*args), condition);
    }
    if (*args[1] == *str_management[CLOSE_PARE]) {
        *ind = 2;
        return get_one_nb_condition(0, condition);
    }
    if (*args[2] == *str_management[CLOSE_PARE])
        return get_condition_one_args(args + 1, condition, ind);
    if (*args[3] == *str_management[CLOSE_PARE])
        return get_condition_two_args(args + 1, condition, ind);
    if (*args[4] == *str_management[CLOSE_PARE])
        return get_condition_three_args(args + 1, condition, ind);
    return ERROR;
}
