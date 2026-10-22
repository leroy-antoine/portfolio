/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** sort_alias_var
*/

#include "mysh.h"
#include <string.h>

bool sort_alias_var(void *data_first, void *data_second)
{
    alias_var_t *first = (alias_var_t *)data_first;
    alias_var_t *second = (alias_var_t *)data_second;

    if (strcmp(first->alias, second->alias) <= 0)
        return true;
    return false;
}
