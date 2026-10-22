/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** free_alias_var
*/

#include "mysh.h"

void free_alias_var(void *data)
{
    alias_var_t *alias_var = (alias_var_t *)data;

    free(alias_var->alias);
    free(alias_var->cmd);
    free(alias_var);
}
