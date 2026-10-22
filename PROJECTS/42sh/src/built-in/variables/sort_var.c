/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** sort_var
*/

#include "mysh.h"
#include <string.h>

bool sort_var(void *data_first, void *data_second)
{
    var_t *first = (var_t *)data_first;
    var_t *second = (var_t *)data_second;

    if (strcmp(first->var, second->var) <= 0)
        return true;
    return false;
}
